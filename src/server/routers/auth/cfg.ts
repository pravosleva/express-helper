/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import md5Hash from '../../utils/md5'

const EXTERNAL_ROUTING = process.env.EXTERNAL_ROUTING || ''
const {
  BASE_PROTOCOL_HOST,
  SP_SVYAZNOY_JWT_SECRET,
  SP_ACCESS_PASSWORD,
  QR_SWAGGER_JWT_SECRET,
  QR_SWAGGER_ACCESS_PASSWORD,
} = process.env

const requiredEnvs = ['BASE_PROTOCOL_HOST', 'SP_SVYAZNOY_JWT_SECRET', 'SP_ACCESS_PASSWORD', 'QR_SWAGGER_JWT_SECRET', 'QR_SWAGGER_ACCESS_PASSWORD']

for (const key of requiredEnvs) {
  if (!process.env[key]) {
    throw new Error(`🚫 Check envs: process.env.${key} is ${typeof process.env[key]}`)
  }
}

export enum EAccessCode {
  OTSvyaznoyV1 = 'sp.otapi.v1.svyaznoy.jwt',
  Homepage = 'demo.access-to-homepage.jwt',
  QRSwagger = 'qr.swagger-access.jwt',
}

// --- Check EAccessCode map:
const hasDuplicate = (arr: string[]): boolean => new Set(arr).size !== arr.length
const keys = Object.values(EAccessCode)
if (hasDuplicate(keys)) {
  const result = keys.reduce(
    (acc, cur) => {
      if (acc[cur]) {
        acc.duplicates.push(cur)
      } else {
        acc[cur] = true
      }
      return acc
    },
    { duplicates: [] }
  )

  throw new Error(`🚫 Check EAccessCode values! Douplicate values: ${result.duplicates.join(', ')}`)
}
// ---
const qr = {
  targetUrl: `${BASE_PROTOCOL_HOST}${EXTERNAL_ROUTING}/auth/go-target`,
}
const redirect = {
  [EAccessCode.OTSvyaznoyV1]: {
    jwtSecret: SP_SVYAZNOY_JWT_SECRET,
    uiName: 'Online Trade-in API (Svyaznoy)',
    accessPassword: SP_ACCESS_PASSWORD,
    hash: md5Hash(EAccessCode.OTSvyaznoyV1),
    logged: `${EXTERNAL_ROUTING}/smartprice/otapi/v1/svyaznoy/swagger/`,
    unlogged: `${EXTERNAL_ROUTING}/auth/signin/`,
    qr,
  },
  [EAccessCode.Homepage]: {
    jwtSecret: 'HOMEPAGE_SECRET_JWT_SAMPLE_ACCESS',
    uiName: 'Homepage',
    accessPassword: 'home',
    hash: md5Hash(EAccessCode.Homepage),
    logged: `${EXTERNAL_ROUTING}/`,
    unlogged: `${EXTERNAL_ROUTING}/auth/signin/`,
    qr,
  },
  [EAccessCode.QRSwagger]: {
    jwtSecret: QR_SWAGGER_JWT_SECRET,
    uiName: 'QR test API documentation',
    accessPassword: QR_SWAGGER_ACCESS_PASSWORD,
    hash: md5Hash(EAccessCode.QRSwagger),
    logged: `${EXTERNAL_ROUTING}/qr/swagger/`, // NOTE: Последний слеш обязательно!
    unlogged: `${EXTERNAL_ROUTING}/auth/signin/`,
    qr,
  },
}
const hashedRedirectMap = new Map()

for (const key in redirect) {
  const hash = md5Hash(key)

  hashedRedirectMap.set(hash, { ...redirect[key], code: key })
}

const accessCode = EAccessCode

export { accessCode, redirect, hashedRedirectMap }
