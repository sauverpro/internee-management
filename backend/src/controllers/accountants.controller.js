import bcrypt from 'bcryptjs'
import { pool } from '../db.js'

export async function list(_req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.full_name, a.email, a.created_at, u.id AS user_id
       FROM accountant_users a
       JOIN users u ON u.id = a.user_id
       ORDER BY a.full_name`,
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function create(req, res) {
  const { full_name, email, password } = req.body
  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'full_name, email and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const hash = await bcrypt.hash(password, 10)
    const normalizedEmail = email.toLowerCase().trim()

    const { rows: userRows } = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'accountant') RETURNING id, email, role`,
      [normalizedEmail, hash],
    )
    const user = userRows[0]

    const { rows: profileRows } = await client.query(
      `INSERT INTO accountant_users (user_id, full_name, email)
       VALUES ($1, $2, $3) RETURNING *`,
      [user.id, full_name, normalizedEmail],
    )

    await client.query('COMMIT')
    res.status(201).json({ ...profileRows[0], user_id: user.id })
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
