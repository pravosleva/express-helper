import express from 'express'
import { gapiRouter } from './gapi'
import { auxStateRouter } from './aux-state'
import { expFamilyRouter } from './exp.family'

const router = express.Router()

router.use(express.json({ limit: '50mb' }))
router.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }))

router.use('/gapi', gapiRouter)
router.use('/aux-state', auxStateRouter)
router.use('/exp.family', expFamilyRouter)

export const subprojectsRouter = router
