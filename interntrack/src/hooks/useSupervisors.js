import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useSupervisors() {
  const [supervisors, setSupervisors] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchSupervisors() {
    setLoading(true)
    const { data, error } = await supabase
      .from('supervisors')
      .select('*')
      .order('full_name')
    if (error) {
      toast.error('Failed to load supervisors')
    } else {
      setSupervisors(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSupervisors()
  }, [])

  async function addSupervisor(data) {
    const { error } = await supabase.from('supervisors').insert(data)
    if (error) throw error
    await fetchSupervisors()
  }

  async function updateSupervisor(id, data) {
    const { error } = await supabase.from('supervisors').update(data).eq('id', id)
    if (error) throw error
    await fetchSupervisors()
  }

  return { supervisors, loading, refetch: fetchSupervisors, addSupervisor, updateSupervisor }
}
