-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- COURSES
-- ─────────────────────────────────────────────
create table courses (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null,
  duration_weeks int not null,
  description text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- SUPERVISORS
-- ─────────────────────────────────────────────
create table supervisors (
  id uuid primary key default uuid_generate_v4(),
  full_name varchar(100) not null,
  school_facility varchar(150) not null,
  department varchar(100),
  email varchar(100) unique not null,
  phone varchar(20),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- INTERNS
-- ─────────────────────────────────────────────
create table interns (
  id uuid primary key default uuid_generate_v4(),
  full_name varchar(100) not null,
  email varchar(100),
  phone varchar(20),
  school_of_origin varchar(150),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- ADMIN USERS (separate from supervisors)
-- ─────────────────────────────────────────────
create table admin_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name varchar(100),
  email varchar(100),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- SUPERVISOR COURSE RATES (negotiation table)
-- ─────────────────────────────────────────────
create table supervisor_course_rates (
  id uuid primary key default uuid_generate_v4(),
  supervisor_id uuid references supervisors(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  agreed_amount numeric(12,2) not null,
  currency varchar(10) default 'RWF',
  status varchar(20) default 'active' check (status in ('active','renegotiated','expired')),
  agreed_by_admin uuid references auth.users(id),
  agreed_at timestamptz default now(),
  notes text
);

-- ─────────────────────────────────────────────
-- INTERN REGISTRATIONS
-- CRITICAL: amount_due is snapshotted at registration time and is immutable.
-- ─────────────────────────────────────────────
create table intern_registrations (
  id uuid primary key default uuid_generate_v4(),
  intern_id uuid references interns(id) on delete cascade,
  supervisor_id uuid references supervisors(id) on delete restrict,
  course_id uuid references courses(id) on delete restrict,
  rate_snapshot_id uuid references supervisor_course_rates(id),
  amount_due numeric(12,2) not null,
  currency varchar(10) default 'RWF',
  start_date date not null,
  end_date date not null,
  status varchar(20) default 'active' check (status in ('active','completed','cancelled')),
  registered_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Prevent amount_due from ever being changed after creation
create or replace function prevent_amount_due_update()
returns trigger as $$
begin
  if new.amount_due <> old.amount_due then
    raise exception 'amount_due is locked at registration and cannot be changed.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger lock_amount_due
before update on intern_registrations
for each row execute function prevent_amount_due_update();

-- ─────────────────────────────────────────────
-- PAYMENTS
-- Each row = one payment event (supports partial payments)
-- ─────────────────────────────────────────────
create table payments (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid references intern_registrations(id) on delete cascade,
  amount_paid numeric(12,2) not null,
  payment_date date not null default current_date,
  payment_status varchar(20) default 'paid' check (payment_status in ('paid','partial','pending','overdue')),
  marked_by uuid references auth.users(id),
  receipt_ref varchar(100),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- SUPERVISOR COMMENTS
-- ─────────────────────────────────────────────
create table supervisor_comments (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid references intern_registrations(id) on delete cascade,
  supervisor_id uuid references supervisors(id) on delete cascade,
  comment text not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- USEFUL VIEW: intern payment summary
-- ─────────────────────────────────────────────
create or replace view intern_payment_summary as
select
  ir.id as registration_id,
  ir.supervisor_id,
  i.full_name as intern_name,
  i.email as intern_email,
  i.phone as intern_phone,
  i.school_of_origin,
  s.full_name as supervisor_name,
  s.school_facility,
  c.name as course_name,
  c.duration_weeks,
  ir.amount_due,
  ir.currency,
  ir.start_date,
  ir.end_date,
  ir.status as registration_status,
  coalesce(sum(p.amount_paid), 0) as total_paid,
  ir.amount_due - coalesce(sum(p.amount_paid), 0) as balance,
  case
    when coalesce(sum(p.amount_paid), 0) >= ir.amount_due then 'paid'
    when coalesce(sum(p.amount_paid), 0) > 0 then 'partial'
    when ir.end_date < current_date then 'overdue'
    else 'pending'
  end as payment_status
from intern_registrations ir
join interns i on i.id = ir.intern_id
join supervisors s on s.id = ir.supervisor_id
join courses c on c.id = ir.course_id
left join payments p on p.registration_id = ir.id
group by ir.id, i.id, s.id, c.id;

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table courses enable row level security;
alter table supervisors enable row level security;
alter table interns enable row level security;
alter table intern_registrations enable row level security;
alter table supervisor_course_rates enable row level security;
alter table payments enable row level security;
alter table supervisor_comments enable row level security;

-- Admins can do everything
create policy "admins_all" on courses for all
  using (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "admins_all" on supervisors for all
  using (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "admins_all" on interns for all
  using (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "admins_all" on intern_registrations for all
  using (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "admins_all" on supervisor_course_rates for all
  using (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "admins_all" on payments for all
  using (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "admins_all" on supervisor_comments for all
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- Supervisors can read their own registrations
create policy "supervisors_read_own" on intern_registrations for select
  using (supervisor_id = (select id from supervisors where user_id = auth.uid()));

-- Supervisors can read their own rates
create policy "supervisors_read_own_rates" on supervisor_course_rates for select
  using (supervisor_id = (select id from supervisors where user_id = auth.uid()));

-- Supervisors can read payments for their interns
create policy "supervisors_read_own_payments" on payments for select
  using (registration_id in (
    select id from intern_registrations
    where supervisor_id = (select id from supervisors where user_id = auth.uid())
  ));

-- Supervisors can manage their own comments
create policy "supervisors_manage_own_comments" on supervisor_comments for all
  using (supervisor_id = (select id from supervisors where user_id = auth.uid()));

-- Supervisors need read access to join tables used in the view
create policy "supervisors_read_interns" on interns for select
  using (exists (select 1 from supervisors where user_id = auth.uid()));

create policy "supervisors_read_supervisors" on supervisors for select
  using (exists (select 1 from supervisors where user_id = auth.uid()));

create policy "supervisors_read_courses" on courses for select
  using (exists (select 1 from supervisors where user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────
insert into courses (name, duration_weeks, description) values
  ('Clinical Medicine', 12, 'General clinical practice in a hospital setting'),
  ('Pharmacy', 8, 'Pharmaceutical dispensing and hospital pharmacy'),
  ('Nursing', 10, 'Clinical nursing practice and patient care'),
  ('Physiotherapy', 8, 'Rehabilitation and physical therapy practice');
