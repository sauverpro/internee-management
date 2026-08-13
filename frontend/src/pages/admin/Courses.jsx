import { useState } from 'react'
import { useCourses } from '../../hooks/useCourses'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import CourseForm from '../../components/forms/CourseForm'

export default function Courses() {
  const { courses, loading, addCourse } = useCourses()
  const [open, setOpen] = useState(false)

  const columns = [
    { key: 'name', label: 'Course name', render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
    { key: 'duration_weeks', label: 'Duration', render: (r) => `${r.duration_weeks} weeks` },
    { key: 'description', label: 'Description', render: (r) => <span className="text-gray-500 text-xs">{r.description || '—'}</span> },
  ]

  return (
    <div>
      <PageHeader title="Courses" subtitle="Manage available internship courses" action={<button onClick={() => setOpen(true)} className="btn-primary">+ Add course</button>} />
      <DataTable columns={columns} data={courses} loading={loading} emptyMessage="No courses yet" />
      <Modal open={open} onClose={() => setOpen(false)} title="Add course">
        <CourseForm onSubmit={addCourse} onClose={() => setOpen(false)} />
      </Modal>
    </div>
  )
}
