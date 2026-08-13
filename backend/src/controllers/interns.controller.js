import { pool } from '../db.js'

export async function list(req, res) {
  try {
    const isSupervisor = req.user.role === 'supervisor'
    const query = isSupervisor
      ? 'SELECT * FROM intern_payment_summary WHERE supervisor_id = $1 ORDER BY intern_name'
      : 'SELECT * FROM intern_payment_summary ORDER BY intern_name'
    const params = isSupervisor ? [req.user.profileId] : []
    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function create(req, res) {
  const { intern, registration } = req.body
  if (!intern?.full_name || !registration?.supervisor_id || !registration?.course_id) {
    return res.status(400).json({
      error: 'intern.full_name, registration.supervisor_id and registration.course_id are required',
    })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: rateRows } = await client.query(
      `SELECT * FROM supervisor_course_rates
       WHERE supervisor_id = $1 AND course_id = $2 AND status = 'active'`,
      [registration.supervisor_id, registration.course_id],
    )
    if (!rateRows[0]) {
      throw new Error('No active rate found for this supervisor + course combination')
    }
    const rate = rateRows[0]

    const { rows: internRows } = await client.query(
      `INSERT INTO interns (full_name, email, phone, school_of_origin)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [intern.full_name, intern.email || null, intern.phone || null, intern.school_of_origin || null],
    )

    const { rows: regRows } = await client.query(
      `INSERT INTO intern_registrations
         (intern_id, supervisor_id, course_id, rate_snapshot_id, amount_due, currency, start_date, end_date, registered_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        internRows[0].id,
        registration.supervisor_id,
        registration.course_id,
        rate.id,
        rate.agreed_amount,
        rate.currency || 'RWF',
        registration.start_date,
        registration.end_date,
        req.user.userId,
      ],
    )

    await client.query('COMMIT')
    res.status(201).json({ intern: internRows[0], registration: regRows[0] })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(400).json({ error: err.message })
  } finally {
    client.release()
  }
}
