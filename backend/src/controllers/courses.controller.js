import { pool } from '../db.js'

export async function list(_req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM courses ORDER BY name')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function create(req, res) {
  const { name, duration_weeks, description } = req.body
  if (!name || !duration_weeks) {
    return res.status(400).json({ error: 'name and duration_weeks are required' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO courses (name, duration_weeks, description)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, Number(duration_weeks), description || null],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}
