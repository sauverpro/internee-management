import bcrypt from 'bcryptjs'
import { pool } from '../db.js'

export async function list(_req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, u.id IS NOT NULL AS has_login
       FROM supervisors s
       LEFT JOIN users u ON u.id = s.user_id
       ORDER BY s.full_name`,
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function create(req, res) {
  const { full_name, school_facility, department, email, phone, password } = req.body
  if (!full_name || !school_facility || !email) {
    return res.status(400).json({ error: 'full_name, school_facility and email are required' })
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const normalizedEmail = email.toLowerCase().trim()
    let userId = null

    if (password) {
      const hash = await bcrypt.hash(password, 10)
      const { rows: userRows } = await client.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, 'supervisor') RETURNING id`,
        [normalizedEmail, hash],
      )
      userId = userRows[0].id
    }

    const { rows } = await client.query(
      `INSERT INTO supervisors (full_name, school_facility, department, email, phone, user_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [full_name, school_facility, department || null, normalizedEmail, phone || null, userId],
    )

    await client.query('COMMIT')
    res.status(201).json({ ...rows[0], has_login: Boolean(userId) })
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.code === '23505') {
      return res.status(400).json({ error: 'An account with this email already exists' })
    }
    res.status(400).json({ error: err.message })
  } finally {
    client.release()
  }
}
