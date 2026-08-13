import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { list, create } from '../controllers/comments.controller.js'

const router = Router()

router.get('/', authenticate, list)
router.post('/', authenticate, create)

export default router
