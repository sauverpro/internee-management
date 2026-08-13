import { pool } from '../db.js'

export async function listSupervisors(_req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, full_name, school_facility, department
       FROM supervisors
       ORDER BY full_name`,
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function listCourses(_req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, duration_weeks, description
       FROM courses
       ORDER BY name`,
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
