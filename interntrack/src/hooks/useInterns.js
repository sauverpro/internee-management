import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useInterns() {
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchInterns() {
    setLoading(true)
    const { data, error } = await supabase
      .from('intern_payment_summary')
      .select('*')
      .order('intern_name')
    if (error) {
      toast.error('Failed to load interns')
    } else {
      setInterns(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInterns()
  }, [])

  async function registerIntern(internData, registrationData) {
    const { data: intern, error: internError } = await supabase
      .from('interns')
      .insert(internData)
      .select()
      .single()
    if (internError) throw internError

    const { error: regError } = await supabase
      .from('intern_registrations')
      .insert({ ...registrationData, intern_id: intern.id })
    if (regError) throw regError

    await fetchInterns()
  }

  return { interns, loading, refetch: fetchInterns, registerIntern }
}
