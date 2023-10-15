import express, { Express as IExpress } from 'express'
import { getModels } from './get-models'
import { getSlugify, rules as getSlugifyRules } from './get-slugify'
import { withReqParamsValidationMW } from '~/utils/express-validation'

const caseServiceApi: IExpress = express()

caseServiceApi.get('/get-models', getModels)
caseServiceApi.post(
  '/get-slugify',
  withReqParamsValidationMW({
    rules: getSlugifyRules,
  }),
  getSlugify,
)

export { caseServiceApi }
