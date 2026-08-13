import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export function useAccountants() {
  const [accountants, setAccountants] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchAccountants() {
    setLoading(true)
    try {
      const { data } = await api.get('/accountants')
      setAccountants(data)
    } catch {
      toast.error('Failed to load accountants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAccountants() }, [])

  async function addAccountant(data) {
    await api.post('/accountants', data)
    await fetchAccountants()
  }

  return { accountants, loading, refetch: fetchAccountants, addAccountant }
}
