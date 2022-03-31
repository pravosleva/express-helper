const express = require('express')
const path = require('path')
// import { EAccessCode, redirect } from '../../../../../auth/cfg'
// import redirectIfUnloggedMw from '../../../../../auth/mws/redirect-if-unlogged'

const swagger = express.Router({ mergeParams: true })
// https://www.npmjs.com/package/swagger-ui-express
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')

// const doc = YAML.load(path.join(__dirname, 'swagger.yaml'))
// const EXTERNAL_ROUTING = process.env.EXTERNAL_ROUTING || ''

// NOTE: See also themes for swagger 3.x: https://github.com/ostranme/swagger-ui-themes/blob/develop/themes/3.x/theme-material.css
const options = {
  // customCssUrl: `${EXTERNAL_ROUTING}/assets/swagger-ui/css/theme-material.modified.sp.css`,
  // customJs: `${EXTERNAL_ROUTING}/assets/swagger-ui/js/onload.js`,
}

export enum EPartner {
  Svyaznoy = 'svyaznoy',
}
const docsMapping = {
  [EPartner.Svyaznoy]: './partner-swagger/svyaznoy.yaml',
}
const getDocPath = (partnerName: string): string | null => {
  return docsMapping[partnerName] || null
}

swagger.use(
  '/',
  function (req, res, next) {
    // From root dir:
    const docPath = getDocPath(req.params.partnerName)

    if (docPath) {
      req.swaggerDoc = YAML.load(path.join(__dirname, docPath))
      next()
    } else {
      res.append('Content-Type', 'application/json')
      res
        .status(500)
        .send({ ok: false, message: `Для партнера ${req.params.partnerName} данный функционал не предусмотрен` })
    }
  },
  // swaggerUi.serveFiles(doc, {}),
  // function (req, res, next) {
  //   doc.host = 'http://localhost:5000/swagger/' // req.get('host')
  //   req.swaggerDoc = doc
  //   next()
  // },
  swaggerUi.serve,
  swaggerUi.setup(null, options)
)

export default swagger
