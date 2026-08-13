import { Router } from 'express'
import { listSupervisors, listCourses } from '../controllers/public.controller.js'
import { create as createInternshipRequest } from '../controllers/publicInternship.controller.js'

const router = Router()

router.get('/supervisors', listSupervisors)
router.get('/courses', listCourses)
router.post('/internship-request', createInternshipRequest)

export default router
