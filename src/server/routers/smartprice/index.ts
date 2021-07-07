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
import crmTradeinsPickupHubsRoute from './mws/api/crm/tradeins/pickup_hubs'
import crmPickupCreateAndSendBatchRoute from './mws/api/crm/pickup/create_and_send_batch'

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
import otApiV1Swagger, { EPartner } from './mws/otapi/v1/[partnerName]/swagger'
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
spApi.get('/api/crm/tradeins/pickup_hubs', jsonParser, crmTradeinsPickupHubsRoute)
spApi.post('/api/crm/pickup/create_and_send_batch', jsonParser, crmPickupCreateAndSendBatchRoute)

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

// 5. Offline Trade-in API imitation
spApi.post('/partner_api/tradein/imei', partnerApiTradeInIMEI)
spApi.post('/partner_api/tradein/phone/check', partnerApiTradeInPhoneCheck)
spApi.post('/partner_api/photo/link', partnerApiTradeInPhotoLink)
spApi.post('/partner_api/photo/status', partnerApiTradeInPhotoStatus)
spApi.post('/partner_api/photo/upload', partnerApiTradeInPhotoUpload)
spApi.post('/partner_api/tradein/decline', partnerApiTradeInDecline)
spApi.get('/partner_api/tools/fms/:code', partnerApiToolsFmsCode)

export default spApi
