import express from 'express'
import bodyParser from 'body-parser'
import { withReqParamsValidationMW } from '~/utils/express-validation/withReqParamsValidationMW'
import { getSinglePersonData, rules as getSinglePersonDataRules } from './get-single-person-data'
import { getPravoslevaPersons, rules as getPravoslevaPersonsRules } from './pravosleva'

const router = express.Router()

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post(
  '/get-single-person-data',
  withReqParamsValidationMW({
    rules: getSinglePersonDataRules,
  }),
  getSinglePersonData,
)
router.get(
  '/pravosleva',
  withReqParamsValidationMW({
    rules: getPravoslevaPersonsRules,
  }),
  getPravoslevaPersons,
)

export const expFamilyRouter = router
