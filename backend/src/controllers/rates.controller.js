import { pool } from '../db.js'

export async function list(req, res) {
  const conditions = []
  const params = []

  if (req.user.role === 'supervisor') {
    params.push(req.user.profileId)
    conditions.push(`scr.supervisor_id = $${params.length}`)
  }

  if (req.query.status) {
    params.push(req.query.status)
    conditions.push(`scr.status = $${params.length}`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  try {
    const { rows } = await pool.query(
      `SELECT scr.*,
         s.full_name AS supervisor_name, s.school_facility,
         c.name AS course_name
       FROM supervisor_course_rates scr
       JOIN supervisors s ON s.id = scr.supervisor_id
       JOIN courses c     ON c.id = scr.course_id
       ${where}
       ORDER BY scr.agreed_at DESC`,
      params,
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getActive(req, res) {
  const { supervisor_id, course_id } = req.query
  if (!supervisor_id || !course_id) {
    return res.status(400).json({ error: 'supervisor_id and course_id are required' })
  }
  try {
    const { rows } = await pool.query(
      `SELECT * FROM supervisor_course_rates
       WHERE supervisor_id = $1 AND course_id = $2 AND status = 'active'`,
      [supervisor_id, course_id],
    )
    res.json(rows[0] ?? null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function create(req, res) {
  const { supervisor_id, course_id, agreed_amount, notes } = req.body
  if (!supervisor_id || !course_id || !agreed_amount) {
    return res.status(400).json({ error: 'supervisor_id, course_id and agreed_amount are required' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(
      `UPDATE supervisor_course_rates
       SET status = 'renegotiated'
       WHERE supervisor_id = $1 AND course_id = $2 AND status = 'active'`,
      [supervisor_id, course_id],
    )

    const { rows } = await client.query(
      `INSERT INTO supervisor_course_rates
         (supervisor_id, course_id, agreed_amount, currency, status, agreed_by_admin, notes)
       VALUES ($1, $2, $3, 'RWF', 'active', $4, $5) RETURNING *`,
      [supervisor_id, course_id, Number(agreed_amount), req.user.userId, notes || null],
    )

    await client.query('COMMIT')
    res.status(201).json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(400).json({ error: err.message })
  } finally {
    client.release()
  }
}
