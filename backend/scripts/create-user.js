/**
 * Create a user in the database with a hashed password.
 *
 * Usage:
 *   node scripts/create-user.js <email> <password> <role> [fullName]
 *
 * Examples:
 *   node scripts/create-user.js admin@hospital.com secret123 admin "System Admin"
 *   node scripts/create-user.js supervisor@gmail.com pass456 supervisor "Dr. Smith"
 */

import bcrypt from 'bcryptjs'
import { pool } from '../src/db.js'
import 'dotenv/config'

const [email, password, role, fullName] = process.argv.slice(2)

if (!email || !password || !['admin', 'supervisor', 'accountant'].includes(role)) {
  console.error('Usage: node scripts/create-user.js <email> <password> <admin|supervisor|accountant> [fullName]')
  process.exit(1)
}


try {
  const hash = await bcrypt.hash(password, 10)

  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
    [email.toLowerCase().trim(), hash, role],
  )
  const user = rows[0]
  console.log(`✓ User created: ${user.email} (${user.role}) — id: ${user.id}`)

  // Auto-create linked profile row
  if (role === 'admin') {
    await pool.query(
      'INSERT INTO admin_users (user_id, full_name, email) VALUES ($1, $2, $3)',
      [user.id, fullName || email, email],
    )
    console.log('✓ admin_users profile created')
  } else if (role === 'accountant') {
    await pool.query(
      'INSERT INTO accountant_users (user_id, full_name, email) VALUES ($1, $2, $3)',
      [user.id, fullName || email, email],
    )
    console.log('✓ accountant_users profile created')
  } else if (role === 'supervisor') {
    if (!fullName) {
      console.log('⚠  No fullName given. Run: INSERT INTO supervisors (user_id, full_name, school_facility, email) VALUES (...)')
    } else {
      console.log(`⚠  Add this supervisor's school_facility manually:\n  INSERT INTO supervisors (user_id, full_name, school_facility, email)\n  VALUES ('${user.id}', '${fullName}', 'Your Hospital', '${email}');`)
    }
  }

} catch (err) {
  console.error('Error:', err.message)
} finally {
  await pool.end()
}
