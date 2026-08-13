import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchCourses() {
    setLoading(true)
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('name')
    if (error) {
      toast.error('Failed to load courses')
    } else {
      setCourses(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  async function addCourse(data) {
    const { error } = await supabase.from('courses').insert(data)
    if (error) throw error
    await fetchCourses()
  }

  async function updateCourse(id, data) {
    const { error } = await supabase.from('courses').update(data).eq('id', id)
    if (error) throw error
    await fetchCourses()
  }

  return { courses, loading, refetch: fetchCourses, addCourse, updateCourse }
}
