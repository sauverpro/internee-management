import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'

async function loadProfile(role, userId) {
  let table
  if (role === 'admin') table = 'admin_users'
  else if (role === 'supervisor') table = 'supervisors'
  else if (role === 'accountant') table = 'accountant_users'
  else table = null

  if (!table) return null
  const { rows } = await pool.query(`SELECT * FROM ${table} WHERE user_id = $1`, [userId])
  return rows[0] ?? null
}

export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()])
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    const profile = await loadProfile(user.role, user.id)

    const token = jwt.sign(
      { userId: user.id, role: user.role, profileId: profile?.id ?? null },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    )

    res.json({ token, role: user.role, profile })
  } catch (err) {
    res.status(500).json({ error: err.message,})
  }
}

export async function me(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [req.user.userId],
    )
    const user = rows[0]
    if (!user) return res.status(404).json({ error: 'User not found' })

    const profile = await loadProfile(user.role, user.id)
    res.json({ ...user, profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
