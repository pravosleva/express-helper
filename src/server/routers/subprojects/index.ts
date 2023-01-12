import express from 'express'
import { gapiRouter } from './gapi'

const router = express.Router()

router.use('/gapi', gapiRouter)

export const subprojectsRouter = router
