import { pool } from '../db.js'

export async function create(req, res) {
  const {
    full_name,
    email,
    phone,
    school_of_origin,
    supervisor_id,
    course_id,
    start_date,
    end_date,
  } = req.body || {}

  if (!full_name || !supervisor_id || !course_id || !start_date || !end_date) {
    return res.status(400).json({
      error:
        'full_name, supervisor_id, course_id, start_date and end_date are required',
    })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: rateRows } = await client.query(
      `SELECT * FROM supervisor_course_rates
       WHERE supervisor_id = $1 AND course_id = $2 AND status = 'active'`,
      [supervisor_id, course_id],
    )

    if (!rateRows[0]) {
      throw new Error('No active rate found for this supervisor + course combination')
    }

    const rate = rateRows[0]

    const { rows: internRows } = await client.query(
      `INSERT INTO interns (full_name, email, phone, school_of_origin)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [full_name, email || null, phone || null, school_of_origin || null],
    )

    const { rows: regRows } = await client.query(
      `INSERT INTO intern_registrations
         (intern_id, supervisor_id, course_id, rate_snapshot_id, amount_due, currency, start_date, end_date, registered_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        internRows[0].id,
        supervisor_id,
        course_id,
        rate.id,
        rate.agreed_amount,
        rate.currency || 'RWF',
        start_date,
        end_date,
        null,
      ],
    )

    await client.query('COMMIT')
    return res.status(201).json({ intern: internRows[0], registration: regRows[0] })
  } catch (err) {
    await client.query('ROLLBACK')
    return res.status(400).json({ error: err.message })
  } finally {
    client.release()
  }
}

