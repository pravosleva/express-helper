import express from 'express'
import { checkSpaceRoute } from './mws/check-space'
import { memRoute } from './mws/mem'

const router = express()

router.get('/check-space', checkSpaceRoute)
router.get('/mem', memRoute)

export const systemRouter = router
