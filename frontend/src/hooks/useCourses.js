import { useState, useEffect } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchCourses() {
    setLoading(true)
    try {
      const { data } = await api.get('/courses')
      setCourses(data)
    } catch {
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  async function addCourse(data) {
    await api.post('/courses', data)
    await fetchCourses()
  }

  return { courses, loading, refetch: fetchCourses, addCourse }
}
