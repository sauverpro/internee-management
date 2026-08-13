import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export function useSupervisors() {
  const [supervisors, setSupervisors] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchSupervisors() {
    setLoading(true)
    try {
      const { data } = await api.get('/supervisors')
      setSupervisors(data)
    } catch {
      toast.error('Failed to load supervisors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSupervisors() }, [])

  async function addSupervisor(data) {
    const payload = { ...data }
    if (!payload.password) delete payload.password
    await api.post('/supervisors', payload)
    await fetchSupervisors()
  }

  return { supervisors, loading, refetch: fetchSupervisors, addSupervisor }
}
