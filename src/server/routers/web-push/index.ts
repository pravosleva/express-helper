import express from 'express'
// import bodyParser from 'body-parser'
import { withReqParamsValidationMW } from '~/utils/express-validation'
import webpush from 'web-push'
import { subscribe, subscribeRules } from './mws/subscribe'
import { sendNotification, sendNotificationRules } from './mws/send-notification'
import { unsubscribe, unsubscribeRules } from './mws/unsubscribe'
import { checkSubscribtion, checkSubscribtionRules } from './mws/check-subscription'

// -- NOTE: Сгенерируйте свои ключи через npx web-push generate-vapid-keys
const publicVapidKey = process.env.EH_WEB_PUSH_VAPID_PUBLIC_KEY || '';
const privateVapidKey = process.env.EH_WEB_PUSH_VAPID_PRIVATE_KEY || '';
const EH_WEB_PUSH_DEVELOPER_EMAIL = process.env.EH_WEB_PUSH_DEVELOPER_EMAIL;

webpush.setVapidDetails(
  `mailto:${EH_WEB_PUSH_DEVELOPER_EMAIL}`,
  publicVapidKey,
  privateVapidKey
)
// --

const webPushApi = express()
// const jsonParser = bodyParser.json()

// webPushApi.use('/subscribe', jsonParser, subscribe)
webPushApi.post(
  '/subscribe',
  withReqParamsValidationMW({
    rules: subscribeRules,
  }),
  subscribe
)
webPushApi.post(
  '/send-notification',
  withReqParamsValidationMW({
    rules: sendNotificationRules,
  }),
  sendNotification
)
webPushApi.post(
  '/unsubscribe',
  withReqParamsValidationMW({
    rules: unsubscribeRules,
  }),
  unsubscribe
)
webPushApi.post(
  '/check-subscription',
  withReqParamsValidationMW({
    rules: checkSubscribtionRules,
  }),
  checkSubscribtion
)

export { webPushApi }
