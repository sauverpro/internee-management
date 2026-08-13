-- InternTrack — Initial Schema

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'supervisor', 'accountant')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COURSES
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  duration_weeks INT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPERVISORS
CREATE TABLE IF NOT EXISTS supervisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100) NOT NULL,
  school_facility VARCHAR(150) NOT NULL,
  department VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN USERS
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACCOUNTANT USERS
CREATE TABLE IF NOT EXISTS accountant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- INTERNS
CREATE TABLE IF NOT EXISTS interns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  school_of_origin VARCHAR(150),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPERVISOR COURSE RATES
CREATE TABLE IF NOT EXISTS supervisor_course_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id UUID REFERENCES supervisors(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  agreed_amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RWF',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','renegotiated','expired')),
  agreed_by_admin UUID REFERENCES users(id),
  agreed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- INTERN REGISTRATIONS (amount_due is snapshotted and immutable)
CREATE TABLE IF NOT EXISTS intern_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intern_id UUID REFERENCES interns(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES supervisors(id) ON DELETE RESTRICT,
  course_id UUID REFERENCES courses(id) ON DELETE RESTRICT,
  rate_snapshot_id UUID REFERENCES supervisor_course_rates(id),
  amount_due NUMERIC(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'RWF',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  registered_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: lock amount_due after creation
CREATE OR REPLACE FUNCTION prevent_amount_due_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount_due <> OLD.amount_due THEN
    RAISE EXCEPTION 'amount_due is locked at registration and cannot be changed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lock_amount_due ON intern_registrations;
CREATE TRIGGER lock_amount_due
BEFORE UPDATE ON intern_registrations
FOR EACH ROW EXECUTE FUNCTION prevent_amount_due_update();

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES intern_registrations(id) ON DELETE CASCADE,
  amount_paid NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('paid','partial','pending','overdue')),
  marked_by UUID REFERENCES users(id),
  receipt_ref VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPERVISOR COMMENTS
CREATE TABLE IF NOT EXISTS supervisor_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES intern_registrations(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES supervisors(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIEW: intern payment summary (balance & status always computed, never stored)
CREATE OR REPLACE VIEW intern_payment_summary AS
SELECT
  ir.id           AS registration_id,
  ir.supervisor_id,
  i.full_name     AS intern_name,
  i.email         AS intern_email,
  i.phone         AS intern_phone,
  i.school_of_origin,
  s.full_name     AS supervisor_name,
  s.school_facility,
  c.name          AS course_name,
  c.duration_weeks,
  ir.amount_due,
  ir.currency,
  ir.start_date,
  ir.end_date,
  ir.status       AS registration_status,
  COALESCE(SUM(p.amount_paid), 0)                           AS total_paid,
  ir.amount_due - COALESCE(SUM(p.amount_paid), 0)          AS balance,
  CASE
    WHEN COALESCE(SUM(p.amount_paid), 0) >= ir.amount_due  THEN 'paid'
    WHEN COALESCE(SUM(p.amount_paid), 0) > 0               THEN 'partial'
    WHEN ir.end_date < CURRENT_DATE                         THEN 'overdue'
    ELSE 'pending'
  END AS payment_status
FROM intern_registrations ir
JOIN interns i       ON i.id = ir.intern_id
JOIN supervisors s   ON s.id = ir.supervisor_id
JOIN courses c       ON c.id = ir.course_id
LEFT JOIN payments p ON p.registration_id = ir.id
GROUP BY ir.id, i.id, s.id, c.id;

-- SEED DATA
INSERT INTO courses (name, duration_weeks, description) VALUES
  ('Clinical Medicine', 12, 'General clinical practice in a hospital setting'),
  ('Pharmacy',          8,  'Pharmaceutical dispensing and hospital pharmacy'),
  ('Nursing',           10, 'Clinical nursing practice and patient care'),
  ('Physiotherapy',     8,  'Rehabilitation and physical therapy practice')
ON CONFLICT DO NOTHING;
