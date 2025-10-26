import express from 'express'
import { withReqParamsValidationMW } from '~/utils/express-validation'
import { generateRules, generate } from './mws/ofr-bff/mocks/authentication/oldLkdms/frame/syncToken/generate'
import { menuRules, getMenu } from './mws/ofr-bff/mocks/menu'
import { getProfileSearch, profileSearchRules } from './mws/ofr-bff/mocks/profile/search'
import { getAccessPolicies, accessPoliciesRules } from './mws/ofr-bff/mocks/profile/accessPolicies'
import { getPolicy, policyRules } from './mws/ofr-bff/mocks/policy'
import { uploadTemporaryFile, temporaryFileRules } from './mws/ofr-bff/mocks/file/temp'
import { uploadFileMiddleware } from './mws/utils/uploadFileMiddleware'
import {
  administrativeTicket, administrativeTicketRules
} from './mws/ofr-bff/mocks/request/administrative'
import {
  administrativeTicketTopics, administrativeTicketTopicsRules
} from './mws/ofr-bff/mocks/request/administrative/topics'
import {
  profileChildAdding, profileChildAddingRules
} from './mws/ofr-bff/mocks/profile/child/add'

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
mgApi.post(
  '/mocks/file/temp',
  cors(),
  withReqParamsValidationMW({
    rules: temporaryFileRules,
  }),
  uploadFileMiddleware('file'),
  uploadTemporaryFile,
)
mgApi.post(
  '/mocks/request/administrative',
  cors(),
  withReqParamsValidationMW({
    rules: administrativeTicketRules,
  }),
  administrativeTicket,
)
mgApi.get(
  '/mocks/request/administrative/topics',
  cors(),
  withReqParamsValidationMW({
    rules: administrativeTicketTopicsRules,
  }),
  administrativeTicketTopics,
)
mgApi.post(
  '/mocks/profile/child/add',
  cors(),
  withReqParamsValidationMW({
    rules: profileChildAddingRules,
  }),
  profileChildAdding,
)

export { mgApi }
