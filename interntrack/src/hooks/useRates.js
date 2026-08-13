import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useRates() {
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchRates() {
    setLoading(true)
    const { data, error } = await supabase
      .from('supervisor_course_rates')
      .select(`*, supervisors(full_name, school_facility), courses(name)`)
      .order('agreed_at', { ascending: false })
    if (error) {
      toast.error('Failed to load rates')
    } else {
      setRates(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRates()
  }, [])

  async function addRate(data) {
    // Mark existing active rate for same supervisor+course as renegotiated
    await supabase
      .from('supervisor_course_rates')
      .update({ status: 'renegotiated' })
      .eq('supervisor_id', data.supervisor_id)
      .eq('course_id', data.course_id)
      .eq('status', 'active')

    const { error } = await supabase
      .from('supervisor_course_rates')
      .insert({ ...data, status: 'active' })
    if (error) throw error
    await fetchRates()
  }

  async function getActiveRate(supervisorId, courseId) {
    const { data, error } = await supabase
      .from('supervisor_course_rates')
      .select('*')
      .eq('supervisor_id', supervisorId)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .maybeSingle()
    if (error) throw error
    return data
  }

  return { rates, loading, refetch: fetchRates, addRate, getActiveRate }
}
