import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { list, create } from '../controllers/accountants.controller.js'

const router = Router()

router.get('/', authenticate, requireAdmin, list)
router.post('/', authenticate, requireAdmin, create)

export default router
