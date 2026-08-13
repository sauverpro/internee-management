import { pool } from '../db.js'

function resolvePeriodRange(period) {
  const now = new Date()
  const to = now.toISOString().slice(0, 10)

  if (period === 'daily') {
    return { from: to, to, label: 'Daily' }
  }

  if (period === 'monthly') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    return {
      from: monthStart.toISOString().slice(0, 10),
      to,
      label: 'Monthly',
    }
  }

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return {
    from: weekStart.toISOString().slice(0, 10),
    to,
    label: 'Weekly',
  }
}

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

export async function report(req, res) {
  try {
    const period = ['daily', 'weekly', 'monthly'].includes(req.query.period)
      ? req.query.period
      : 'weekly'
    const { from, to, label } = resolvePeriodRange(period)

    const { rows: totalsRows } = await pool.query(
      `SELECT
         COUNT(*)::int AS payment_count,
         COALESCE(SUM(amount_paid), 0)::numeric AS total_collected,
         COUNT(DISTINCT registration_id)::int AS registrations_paid
       FROM payments
       WHERE payment_date >= $1 AND payment_date <= $2`,
      [from, to],
    )

    const { rows: payments } = await pool.query(
      `SELECT
         p.id,
         p.registration_id,
         p.amount_paid,
         p.payment_date,
         p.payment_status,
         p.receipt_ref,
         ips.intern_name,
         ips.course_name,
         ips.supervisor_name,
         ips.currency
       FROM payments p
       JOIN intern_payment_summary ips ON ips.registration_id = p.registration_id
       WHERE p.payment_date >= $1 AND p.payment_date <= $2
       ORDER BY p.payment_date DESC, p.created_at DESC
       LIMIT 100`,
      [from, to],
    )

    const { rows: summaryRows } = await pool.query(
      `SELECT
         COUNT(*)::int AS total_interns,
         COUNT(*) FILTER (WHERE payment_status = 'paid')::int AS fully_paid,
         COUNT(*) FILTER (WHERE payment_status <> 'paid')::int AS pending_interns,
         COALESCE(SUM(balance), 0)::numeric AS outstanding
       FROM intern_payment_summary`,
    )

    res.json({
      period,
      label,
      from,
      to,
      totals: totalsRows[0],
      summary: summaryRows[0],
      payments,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function create(req, res) {
  const { registration_id, amount_paid, payment_date, payment_status, receipt_ref } = req.body
  if (!registration_id || !amount_paid || !payment_date) {
    return res.status(400).json({ error: 'registration_id, amount_paid and payment_date are required' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO payments (registration_id, amount_paid, payment_date, payment_status, marked_by, receipt_ref)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        registration_id,
        Number(amount_paid),
        payment_date,
        payment_status || 'paid',
        req.user.userId,
        receipt_ref || null,
      ],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}
