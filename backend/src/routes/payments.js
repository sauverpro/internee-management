import { Router } from 'express'
import { authenticate, requireAdminOrAccountant } from '../middleware/auth.js'
import { list, create, report } from '../controllers/payments.controller.js'

const router = Router()

router.get('/report', authenticate, report)
router.get('/', authenticate, list)
router.post('/', authenticate, requireAdminOrAccountant, create)

export default router
