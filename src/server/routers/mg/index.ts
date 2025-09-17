import express from 'express'
import { withReqParamsValidationMW } from '~/utils/express-validation'
import { generateRules, generate } from './mws/ofr-bff/mocks/authentication/oldLkdms/frame/syncToken/generate'
import { menuRules, getMenu } from './mws/ofr-bff/mocks/menu'
import { getProfileSearch, profileSearchRules } from './mws/ofr-bff/mocks/profile/search'
import { getAccessPolicies, accessPoliciesRules } from './mws/ofr-bff/mocks/profile/accessPolicies'
import { getPolicy, policyRules } from './mws/ofr-bff/mocks/policy'

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
mgApi.get(
  '/mocks/policy',
  cors(),
  withReqParamsValidationMW({
    rules: policyRules,
  }),
  getPolicy,
)
mgApi.get(
  '/mocks/profile/search',
  cors(),
  withReqParamsValidationMW({
    rules: profileSearchRules,
  }),
  getProfileSearch,
)
mgApi.get(
  '/mocks/profile/accessPolicies',
  cors(),
  withReqParamsValidationMW({
    rules: accessPoliciesRules,
  }),
  getAccessPolicies,
)

export { mgApi }
