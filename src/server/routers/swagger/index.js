const express = require('express')
const path = require('path')

const swagger = express()
// https://www.npmjs.com/package/swagger-ui-express
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')

swagger.use(
  '/',
  function (req, _res, next) {
    req.swaggerDoc = YAML.load(path.join(__dirname, './swagger.yaml'))
    next()
  },
  swaggerUi.serve,
  swaggerUi.setup()
)

module.exports = swagger
