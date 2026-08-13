import { pool } from '../db.js'

export async function list(req, res) {
  const { registration_id, registration_ids } = req.query
  try {
    if (registration_id) {
      const { rows } = await pool.query(
        'SELECT * FROM supervisor_comments WHERE registration_id = $1 ORDER BY created_at DESC',
        [registration_id],
      )
      return res.json(rows)
    }

    if (registration_ids) {
      const ids = registration_ids.split(',').filter(Boolean)
      if (!ids.length) return res.json([])
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(',')
      const { rows } = await pool.query(
        `SELECT * FROM supervisor_comments WHERE registration_id IN (${placeholders}) ORDER BY created_at DESC`,
        ids,
      )
      return res.json(rows)
    }

    if (req.user.role === 'supervisor') {
      const { rows } = await pool.query(
        `SELECT sc.* FROM supervisor_comments sc
         JOIN intern_registrations ir ON ir.id = sc.registration_id
         WHERE ir.supervisor_id = $1
         ORDER BY sc.created_at DESC`,
        [req.user.profileId],
      )
      return res.json(rows)
    }

    const { rows } = await pool.query('SELECT * FROM supervisor_comments ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function create(req, res) {
  const { registration_id, comment } = req.body
  if (!registration_id || !comment?.trim()) {
    return res.status(400).json({ error: 'registration_id and comment are required' })
  }

  try {
    const supervisorId = req.user.profileId

    if (req.user.role === 'supervisor') {
      const { rows } = await pool.query(
        'SELECT id FROM intern_registrations WHERE id = $1 AND supervisor_id = $2',
        [registration_id, supervisorId],
      )
      if (!rows[0]) return res.status(403).json({ error: 'You can only comment on your own interns' })
    }

    const { rows } = await pool.query(
      `INSERT INTO supervisor_comments (registration_id, supervisor_id, comment)
       VALUES ($1, $2, $3) RETURNING *`,
      [registration_id, supervisorId, comment.trim()],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}
