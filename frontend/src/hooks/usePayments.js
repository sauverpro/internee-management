import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export function usePayments() {
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchPayments() {
    setLoading(true)
    try {
      const { data } = await api.get('/payments')
      setSummary(data)
    } catch {
      toast.error('Failed to load payment data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPayments() }, [])

  async function addPayment(data) {
    await api.post('/payments', data)
    await fetchPayments()
  }

  return { summary, loading, refetch: fetchPayments, addPayment }
}
