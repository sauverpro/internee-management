import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import authRoutes from './routes/auth.js'
import supervisorRoutes from './routes/supervisors.js'
import internRoutes from './routes/interns.js'
import courseRoutes from './routes/courses.js'
import rateRoutes from './routes/rates.js'
import paymentRoutes from './routes/payments.js'
import commentRoutes from './routes/comments.js'
import publicRoutes from './routes/public.js'
import accountantRoutes from './routes/accountants.js'

const app = express()


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/supervisors', supervisorRoutes)
app.use('/api/interns', internRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/rates', rateRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/accountants', accountantRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`InternTrack API running on http://localhost:${PORT}`)
})
