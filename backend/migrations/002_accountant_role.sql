-- Add accountant role support + profile table

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'supervisor', 'accountant'));

CREATE TABLE IF NOT EXISTS accountant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

