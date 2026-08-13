import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { list, create } from '../controllers/interns.controller.js'

const router = Router()

router.get('/', authenticate, list)
router.post('/', authenticate, requireAdmin, create)

export default router
