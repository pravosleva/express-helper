/* eslint-disable import/extensions */
import express from 'express'
// Create application/json parser
import bodyParser from 'body-parser'
import catalogCounterRoute from './mws/api/catalog'
import cartMutationRoute from './mws/api/cdb-post'
import cartDeleteRoute from './mws/api/cdb-delete'
import cartOrderRoute from './mws/api/cart-order'
import deliverypriceForCitiesAutocompleteRoute from './mws/api/autocomplete/deliveryprice_for_cities'
import streetsAutocompleteRoute from './mws/api/autocomplete/streets'
import checkDiscountPromoRoute from './mws/api/check-discount'
import warrantyPageRoute from './mws/api/warranty_claim_email'
import { tradeinsIndex } from './mws/api/crm/tradeins'
import crmTradeinsPickupHubsRoute from './mws/api/crm/tradeins/pickup_hubs'
import { createAndSendBatch as crmPickupCreateAndSendBatchRoute } from './mws/api/crm/pickup/create_and_send_batch'
import crmProductsBuyoutBatchRoute from './mws/api/crm/crmproducts/buyout_batch'
import { crmStatesIndex } from './mws/api/crm/crmstates'
import { crmRequestTypesIndex } from './mws/api/crm/crmrequest-types'
import { search as crmSearch } from './mws/api/crm/crmrequests/search'
import { crmBidId, rules as crmBidIdRules } from './mws/api/crm/crmrequests/[bid_id]'
import { crmProductRejectionReasonsIndex, crmProductRejectionReasonsRating } from './mws/api/crm/crmproduct-rejection-reasons'
import { crmProducts } from './mws/api/crm/products'
import { crmMarketingPartners } from './mws/api/crm/marketing/partners'
import { crmDiscountReasons } from './mws/api/crm/crmproduct-discount-reasons'
import { crmProductVariantsIndex, crmProductVariantsAllParams, crmReadyForSelling } from './mws/api/crm/productvariants'
import { crmServiceCenters } from './mws/api/crm/service-centers'
import { crmUsers, crmUsersMe } from './mws/api/crm/users'
import { crmProductsIdIndex, crmProductsIDNextStates } from './mws/api/crm/crmproducts/[id]'
import { crmPriceMultipliersFlags } from './mws/api/crm/pricemultipliers'
import { crmHistoryTradeinId, crmHistoryProductId } from './mws/api/crm/history'
import { analyticsEvent } from './mws/api/analytics/event'

import md5Make from './mws/md5/make'

import catalogDataRoute from './mws/fapi/get-catalog-data'

import otApiV1GetIMEI from './mws/otapi/v1/[partnerName]/imei'
import otApiV1ConfirmDetection from './mws/otapi/v1/[partnerName]/confirm_detection'
import otApiV1Diagnostics from './mws/otapi/v1/[partnerName]/diagnostics'
import otApiV1AcceptPreprice from './mws/otapi/v1/[partnerName]/accept_preprice'
import otApiV1DeclinePreprice from './mws/otapi/v1/[partnerName]/decline_price'
import otApiV1PhotoUpload from './mws/otapi/v1/[partnerName]/photo_upload'
import otApiV1CheckState from './mws/otapi/v1/[partnerName]/check_state'
import otApiV1AcceptPrice from './mws/otapi/v1/[partnerName]/accept_price'
import otApiV1BuyoutDocForm from './mws/otapi/v1/[partnerName]/buyout_doc_form'
import otApiV1SignBuyoutDoc from './mws/otapi/v1/[partnerName]/sign_buyout_doc'
import otApiV1ReuploadPhotos from './mws/otapi/v1/[partnerName]/reupload_photos'
import otApiV1Swagger, { EPartner } from './mws/otapi/v1/[partnerName]/swagger'
import courierApi from './mws/otapi/v1/[partnerName]/handover'
import { getSubsidiesRoute } from './mws/otapi/v1/[partnerName]/get_subsidies'
// import checkAuth from '../auth/mws/check-jwt'
import { EAccessCode, redirect } from '../auth/cfg'
import redirectIfUnloggedMw from '../auth/mws/redirect-if-unlogged'

import partnerApiTradeInIMEI from './mws/partner_api/tradein/imei'
import partnerApiTradeInPhoneCheck from './mws/partner_api/tradein/phone/check'
import partnerApiTradeInPhotoLink from './mws/partner_api/photo/link'
import partnerApiTradeInPhotoStatus from './mws/partner_api/photo/status'
import partnerApiTradeInPhotoUpload from './mws/partner_api/photo/upload'
import partnerApiTradeInDecline from './mws/partner_api/tradein/decline'
import partnerApiToolsFmsCode from './mws/partner_api/tools/fms/[code]'
import otWebApiFizotLandingForm from './mws/ot-web/fizot-landing-form'
import { sendSMSCode } from './mws/partner_api/tradein/buyout_doc/send_sms_code'
import { signBySMSCode } from './mws/partner_api/tradein/buyout_doc/sign_by_sms_code'
import { clientData } from './mws/partner_api/tradein/client/data'
import { addPayoutCard } from './mws/partner_api/tradein/payout_card/add'
import { replaceAddPayoutCard } from './mws/partner_api/tradein/payout_card/replace'
import { addingPayoutCardStatus } from './mws/partner_api/tradein/payout_card/status'
import { payoutCardSendIframeSMS } from './mws/partner_api/tradein/payout_card/send_iframe_sms'
import { checkFMIP } from './mws/partner_api/tradein/check_fmip'
import { acceptApi } from './mws/partner_api/tradein/accept'
import { sendFmipInstructions } from './mws/partner_api/tradein/send_fmip_instructions'
import { policyConfirmationSMS } from './mws/partner_api/tradein/personal_data_processing_agreement/send_sms_code'
import { signBySMSCode as signBySMSCode2 } from './mws/partner_api/tradein/personal_data_processing_agreement/sign_by_sms_code'
import { waitForVerified } from './mws/partner_api/tradein/wait_for/verified'
import { boughtDevice } from './mws/partner_api/tradein/bought_device'

import cors from 'cors'
import { reportAddAPI, reportGetStateAPI, reportResolveIssueAPI } from './mws/report'
import { reportV2 } from './mws/report/v2'
import { withReqParamsValidationMW } from '~/utils/express-validation/withReqParamsValidationMW'

// const formidable = require('cyberjon-express-formidable')

const jsonParser = bodyParser.json()

const spApi = express()

// spApi.use(formidable())

// 1. Special API imitation
spApi.get('/api/catalog', catalogCounterRoute)
spApi.post('/api/cdb', cartMutationRoute)
spApi.delete('/api/cdb', cartDeleteRoute)
spApi.post('/api/cart-order', cartOrderRoute)
spApi.post('/api/autocomplete/deliveryprice_for_cities', deliverypriceForCitiesAutocompleteRoute)
spApi.post('/api/autocomplete/streets', streetsAutocompleteRoute)
spApi.post('/api/check-discount', checkDiscountPromoRoute)
spApi.post('/api/warranty_claim_email', jsonParser, warrantyPageRoute)
spApi.get('/api/crm/tradeins', jsonParser, cors(), tradeinsIndex)
spApi.get('/api/crm/tradeins/pickup_hubs', jsonParser, crmTradeinsPickupHubsRoute)
spApi.post('/api/crm/pickup/create_and_send_batch', jsonParser, crmPickupCreateAndSendBatchRoute)
spApi.post('/api/crm/crmproducts/buyout_batch', jsonParser, crmProductsBuyoutBatchRoute)
spApi.get('/api/crm/crmstates', jsonParser, crmStatesIndex)
spApi.get('/api/crm/crmrequest-types', jsonParser, crmRequestTypesIndex)
spApi.post('/api/crm/crmrequests/search', jsonParser, crmSearch)
spApi.patch('/api/crm/crmrequests/:bid_id', jsonParser, withReqParamsValidationMW({
  rules: crmBidIdRules,
}), crmBidId)
spApi.get('/api/crm/crmproduct-rejection-reasons', jsonParser, crmProductRejectionReasonsIndex)
spApi.get('/api/crm/crmproduct-rejection-reasons/rating', jsonParser, crmProductRejectionReasonsRating)
spApi.get('/api/crm/products', crmProducts)
spApi.get('/api/crm/marketing/partners', jsonParser, crmMarketingPartners)
spApi.get('/api/crm/crmproduct-discount-reasons', jsonParser, crmDiscountReasons)
spApi.get('/api/crm/productvariants', jsonParser, crmProductVariantsIndex)
spApi.get('/api/crm/productvariants/all_params', jsonParser, crmProductVariantsAllParams)
spApi.get('/api/crm/productvariants/ready_for_selling', jsonParser, crmReadyForSelling)
spApi.get('/api/crm/service-centers', jsonParser, crmServiceCenters)
spApi.get('/api/crm/users', jsonParser, crmUsers)
spApi.post('/api/crm/users/me', jsonParser, crmUsersMe)
spApi.get('/api/crm/crmproducts/:productId/', jsonParser, crmProductsIdIndex)
// spApi.patch('/api/crm/crmproducts/:productId/', jsonParser, crmProductsIdIndex)
spApi.get('/api/crm/crmproducts/:productId/next_states/', jsonParser, crmProductsIDNextStates)
spApi.get('/api/crm/pricemultipliers/flags', jsonParser, crmPriceMultipliersFlags)
spApi.get('/api/crm/history/tradein/:tradeinId', jsonParser, crmHistoryTradeinId)
spApi.get('/api/crm/history/product/:productId', jsonParser, crmHistoryProductId)
spApi.post('/api/analytics/event', jsonParser, analyticsEvent)

// 2. Frontend API imitation (не совсем понятно, почему Гена так называет часть запросов из клиента)
spApi.get('/fapi/get-catalog-data', catalogDataRoute)

// 3. Etc.
spApi.get('/md5/make', jsonParser, md5Make)

// 4. Online Trade-in API imitation
// 4.1 Docs for partners
spApi.use(
  '/otapi/v1/:partnerName/swagger',
  function (req, res, next) {
    switch (req.params.partnerName) {
      // 4.1.1 Access
      case EPartner.Svyaznoy:
        redirectIfUnloggedMw(redirect[EAccessCode.OTSvyaznoyV1].jwtSecret, EAccessCode.OTSvyaznoyV1)(req, res, next)
        break;
      // TODO: Other partner...
      default:
        res.status(500).json({ ok: false, message: '🖕 SORRY 🖕', _originalBody: { params: req.params } })
        break
    }
  },
  // redirectIfUnloggedMw(redirect[EAccessCode.OTSvyaznoyV1].jwtSecret, EAccessCode.OTSvyaznoyV1),
  otApiV1Swagger
)
// 4.2 Etc.
spApi.post('/otapi/v1/:partnerName/imei', otApiV1GetIMEI)
spApi.post('/otapi/v1/:partnerName/confirm_detection', otApiV1ConfirmDetection)
spApi.post('/otapi/v1/:partnerName/diagnostics', otApiV1Diagnostics)
spApi.post('/otapi/v1/:partnerName/accept_preprice', otApiV1AcceptPreprice)
spApi.post('/otapi/v1/:partnerName/decline_price', otApiV1DeclinePreprice)
spApi.post('/otapi/v1/:partnerName/photo_upload', otApiV1PhotoUpload)
spApi.post('/otapi/v1/:partnerName/check_state', otApiV1CheckState)
spApi.post('/otapi/v1/:partnerName/accept_price', otApiV1AcceptPrice)
spApi.post('/otapi/v1/:partnerName/buyout_doc_form', otApiV1BuyoutDocForm)
spApi.post('/otapi/v1/:partnerName/sign_buyout_doc', otApiV1SignBuyoutDoc)
spApi.post('/otapi/v1/:partnerName/reupload_photos', otApiV1ReuploadPhotos)
spApi.use('/otapi/v1/:partnerName/handover', courierApi)
spApi.post('/otapi/v1/:partnerName/get_subsidies', getSubsidiesRoute)

// 5. Offline Trade-in API imitation
spApi.post('/partner_api/tradein/imei', partnerApiTradeInIMEI)
spApi.post('/partner_api/tradein/phone/check', partnerApiTradeInPhoneCheck)
spApi.post('/partner_api/photo/link', partnerApiTradeInPhotoLink)
spApi.post('/partner_api/photo/status', partnerApiTradeInPhotoStatus)
spApi.post('/partner_api/photo/upload', partnerApiTradeInPhotoUpload)
spApi.post('/partner_api/tradein/decline', partnerApiTradeInDecline)
spApi.get('/partner_api/tools/fms/:code', partnerApiToolsFmsCode)
spApi.post('/partner_api/tradein/buyout_doc/send_sms_code', sendSMSCode)
spApi.post('/partner_api/tradein/buyout_doc/sign_by_sms_code', signBySMSCode)
spApi.post('/partner_api/tradein/client/data', clientData)
spApi.post('/partner_api/tradein/payout_card/add', addPayoutCard)
spApi.post('/partner_api/tradein/payout_card/replace', replaceAddPayoutCard)
spApi.post('/partner_api/tradein/payout_card/status', addingPayoutCardStatus)
spApi.post('/partner_api/tradein/payout_card/send_iframe_sms', payoutCardSendIframeSMS)
spApi.post('/partner_api/tradein/check_fmip', jsonParser, checkFMIP)
spApi.post('/partner_api/tradein/accept', jsonParser, acceptApi)
spApi.post('/partner_api/tradein/send_fmip_instructions', sendFmipInstructions)
spApi.post('/partner_api/tradein/personal_data_processing_agreement/send_sms_code', policyConfirmationSMS)
spApi.post('/partner_api/tradein/personal_data_processing_agreement/sign_by_sms_code', signBySMSCode2)
spApi.post('/partner_api/tradein/wait_for/verified', waitForVerified)
spApi.post('/partner_api/tradein/bought_device', boughtDevice)

// 6. New OT landing
spApi.post('/ot-web/fizot-landing-form', otWebApiFizotLandingForm)

// 7. Report
spApi.post('/report/add', reportAddAPI)
spApi.get('/report/get-state', reportGetStateAPI)
spApi.get('/report/resolve-issue', reportResolveIssueAPI)
spApi.use('/report/v2', reportV2)

export default spApi
