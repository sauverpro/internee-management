import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import MetricCard from '../../components/ui/MetricCard'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import {
  IconUsers,
  IconCreditCard,
  IconAlertCircle,
  IconLayoutDashboard,
  IconCalendar,
  IconClock,
  IconTablePlus,
  IconReceipt,
} from '@tabler/icons-react'

export default function AccountantDashboard() {
  const { profile } = useAuth()
  const [summary, setSummary] = useState([])
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reportLoading, setReportLoading] = useState(true)
  const [reportPeriod, setReportPeriod] = useState('weekly')

  const [marking, setMarking] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [receiptRef, setReceiptRef] = useState('')

  const loadSummary = useCallback(async () => {
    const { data } = await api.get('/payments')
    setSummary(data)
  }, [])

  const loadReport = useCallback(async (period) => {
    setReportLoading(true)
    try {
      const { data } = await api.get('/payments/report', { params: { period } })
      setReport(data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load finance report')
    } finally {
      setReportLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    loadSummary().finally(() => setLoading(false))
  }, [loadSummary])

  useEffect(() => {
    loadReport(reportPeriod)
  }, [loadReport, reportPeriod])

  const paidCount = summary.filter((r) => r.payment_status === 'paid').length
  const unpaidCount = summary.filter((r) => r.payment_status !== 'paid').length
  const outstanding = summary.reduce((acc, r) => acc + Number(r.balance || 0), 0)

  const summaryColumns = useMemo(
    () => [
      {
        key: 'intern_name',
        label: 'Intern',
        render: (r) => (
          <div>
            <p className="font-medium text-gray-900">{r.intern_name}</p>
            <p className="text-xs text-gray-400">{r.course_name}</p>
          </div>
        ),
      },
      { key: 'supervisor_name', label: 'Supervisor' },
      {
        key: 'amount_due',
        label: 'Due',
        render: (r) => `RWF ${Number(r.amount_due || 0).toLocaleString()}`,
      },
      {
        key: 'total_paid',
        label: 'Paid',
        render: (r) => `RWF ${Number(r.total_paid || 0).toLocaleString()}`,
      },
      {
        key: 'payment_status',
        label: 'Status',
        render: (r) => <Badge status={r.payment_status} />,
      },
      {
        key: 'balance',
        label: 'Balance',
        render: (r) => `RWF ${Number(r.balance || 0).toLocaleString()}`,
      },
      {
        key: 'registration_id',
        label: 'Action',
        render: (r) => (
          <button
            type="button"
            className="btn-secondary px-3 py-2"
            onClick={() => {
              setSelectedRegistration(r)
              setAmountPaid(String(r.balance || r.amount_due || ''))
            }}
          >
            Record payment
          </button>
        ),
      },
    ],
    [],
  )

  const reportColumns = useMemo(
    () => [
      {
        key: 'payment_date',
        label: 'Date',
        render: (r) => new Date(r.payment_date).toLocaleDateString(),
      },
      {
        key: 'intern_name',
        label: 'Intern',
        render: (r) => (
          <div>
            <p className="font-medium text-gray-900">{r.intern_name}</p>
            <p className="text-xs text-gray-400">{r.course_name}</p>
          </div>
        ),
      },
      { key: 'supervisor_name', label: 'Supervisor' },
      {
        key: 'amount_paid',
        label: 'Amount',
        render: (r) => `${r.currency || 'RWF'} ${Number(r.amount_paid || 0).toLocaleString()}`,
      },
      {
        key: 'receipt_ref',
        label: 'Receipt',
        render: (r) => r.receipt_ref || '—',
      },
    ],
    [],
  )

  async function handleMarkPayment(e) {
    e.preventDefault()
    if (!selectedRegistration) {
      toast.error('Select an intern registration first')
      return
    }

    const amountNum = Number(amountPaid)
    if (!amountPaid || Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error('Enter a valid amount paid')
      return
    }

    try {
      setMarking(true)
      await api.post('/payments', {
        registration_id: selectedRegistration.registration_id,
        amount_paid: amountNum,
        payment_date: paymentDate,
        payment_status: amountNum >= Number(selectedRegistration.balance || 0) ? 'paid' : 'partial',
        receipt_ref: receiptRef || null,
      })
      toast.success('Payment recorded')
      setSelectedRegistration(null)
      setAmountPaid('')
      setReceiptRef('')
      await Promise.all([loadSummary(), loadReport(reportPeriod)])
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to record payment')
    } finally {
      setMarking(false)
    }
  }

  const reportTotals = report?.totals || {}
  const reportSummary = report?.summary || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Finance dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Record enternee payments and review finance reports</p>
        <p className="text-xs text-gray-400 mt-1">Welcome, {profile?.full_name ?? 'Accountant'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total interns" value={summary.length} icon={IconUsers} />
        <MetricCard label="Fully paid" value={paidCount} icon={IconCreditCard} color="success" />
        <MetricCard
          label="Pending / overdue"
          value={unpaidCount}
          sub={`RWF ${outstanding.toLocaleString()} outstanding`}
          icon={IconAlertCircle}
          color="warning"
        />
        <MetricCard
          label="Outstanding total"
          value={outstanding ? `RWF ${outstanding.toLocaleString()}` : '0'}
          icon={IconLayoutDashboard}
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Finance reports</h2>
            <p className="text-xs text-gray-500 mt-0.5">Collections and payment activity by period</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Period</label>
            <select
              className="input"
              style={{ padding: '6px 12px', width: 'auto' }}
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <IconCalendar size={16} />
          <span className="font-medium">{report?.label ?? 'Report'}</span>
          {report?.from && (
            <span className="text-xs text-gray-400">
              {report.from === report.to ? report.from : `${report.from} → ${report.to}`}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="rounded-lg bg-teal-50 border border-teal-100 p-3">
            <div className="text-xs text-teal-700">Collected this period</div>
            <div className="text-lg font-semibold text-teal-900">
              RWF {Number(reportTotals.total_collected || 0).toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
            <div className="text-xs text-gray-500">Payments recorded</div>
            <div className="text-lg font-semibold text-gray-900">{reportTotals.payment_count ?? 0}</div>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
            <div className="text-xs text-gray-500">Registrations paid</div>
            <div className="text-lg font-semibold text-gray-900">{reportTotals.registrations_paid ?? 0}</div>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
            <div className="text-xs text-amber-700">Total outstanding</div>
            <div className="text-lg font-semibold text-amber-900">
              RWF {Number(reportSummary.outstanding || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <DataTable
          columns={reportColumns}
          data={report?.payments ?? []}
          loading={reportLoading}
          emptyMessage="No payments recorded in this period"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">All enternee payment status</h2>
            <DataTable
              columns={summaryColumns}
              data={summary}
              loading={loading}
              emptyMessage="No payment records yet"
            />
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <IconReceipt size={16} />
              Record payment
            </h2>

            {selectedRegistration ? (
              <div className="mb-4 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm">
                <p className="font-medium text-gray-900">{selectedRegistration.intern_name}</p>
                <p className="text-xs text-gray-500">{selectedRegistration.course_name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Balance: RWF {Number(selectedRegistration.balance || 0).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-4">Select an intern from the table to record a payment.</p>
            )}

            <form onSubmit={handleMarkPayment} className="space-y-3">
              <div>
                <label className="label">Amount paid</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Enter amount"
                  disabled={!selectedRegistration}
                />
              </div>

              <div>
                <label className="label">Payment date</label>
                <input
                  type="date"
                  className="input"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  disabled={!selectedRegistration}
                />
              </div>

              <div>
                <label className="label">Receipt reference (optional)</label>
                <input
                  className="input"
                  value={receiptRef}
                  onChange={(e) => setReceiptRef(e.target.value)}
                  placeholder="e.g. RCPT-2026-001"
                  disabled={!selectedRegistration}
                />
              </div>

              <button type="submit" disabled={marking || !selectedRegistration} className="btn-primary w-full">
                {marking ? (
                  <span className="flex items-center justify-center gap-2">
                    <IconClock size={16} /> Recording…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <IconTablePlus size={16} /> Record payment
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
