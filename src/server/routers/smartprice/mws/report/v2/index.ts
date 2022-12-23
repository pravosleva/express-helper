import express from 'express'
import { sendRDError } from './gapi-rd-errors/send'

const router = express.Router()

router.post('/gapi-rd-errors/send', sendRDError)

export const reportV2 = router
