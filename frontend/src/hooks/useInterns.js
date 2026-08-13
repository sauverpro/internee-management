import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export function useInterns() {
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchInterns() {
    setLoading(true)
    try {
      const { data } = await api.get('/interns')
      setInterns(data)
    } catch {
      toast.error('Failed to load interns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInterns() }, [])

  async function registerIntern(internData, registrationData) {
    await api.post('/interns', { intern: internData, registration: registrationData })
    await fetchInterns()
  }

  return { interns, loading, refetch: fetchInterns, registerIntern }
}
