import express from 'express'
import { withReqParamsValidationMW } from '~/utils/express-validation'
import { generateRules, generate } from './mws/ofr-bff/mocks/authentication/oldLkdms/frame/syncToken/generate'
import { menuRules, getMenu } from './mws/ofr-bff/mocks/menu'
import cors from 'cors'

const mgApi = express()

mgApi.get(
  '/mocks/menu',
  cors(),
  withReqParamsValidationMW({
    rules: menuRules,
  }),
  getMenu,
)
mgApi.post(
  '/mocks/authentication/oldLkdms/frame/syncToken/generate',
  cors(),
  withReqParamsValidationMW({
    rules: generateRules,
  }),
  generate,
)

export { mgApi }
