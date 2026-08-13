import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export function useRates() {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchRates() {
    setLoading(true)
    try {
      const { data } = await api.get('/rates')
      setRates(data)
    } catch {
      toast.error('Failed to load rates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRates() }, [])

  async function addRate(data) {
    await api.post('/rates', data)
    await fetchRates()
  }

  return { rates, loading, refetch: fetchRates, addRate }
}
