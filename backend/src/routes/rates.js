import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { list, getActive, create } from '../controllers/rates.controller.js'

const router = Router()

router.get('/', authenticate, list)
router.get('/active', authenticate, getActive)
router.post('/', authenticate, requireAdmin, create)

export default router
