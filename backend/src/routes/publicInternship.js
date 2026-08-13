import { Router } from 'express'
import { create } from '../controllers/publicInternship.controller.js'

const router = Router()

// Public endpoint: student internship request from landing page
router.post('/', create)

export default router

