import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function usePayments() {
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchPayments() {
    setLoading(true)
    const { data, error } = await supabase
      .from('intern_payment_summary')
      .select('*')
      .order('intern_name')
    if (error) {
      toast.error('Failed to load payment data')
    } else {
      setSummary(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  async function addPayment(data) {
    const { error } = await supabase.from('payments').insert(data)
    if (error) throw error
    await fetchPayments()
  }

  return { summary, loading, refetch: fetchPayments, addPayment }
}
