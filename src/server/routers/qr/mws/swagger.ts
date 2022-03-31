import express, { Response as IResponse } from 'express'
import { ICustomRequest } from '../../../utils/interfaces'
import path from 'path'

const swaggerApi = express()
// See also: https://www.npmjs.com/package/swagger-ui-express
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'

swaggerApi.use(
  '/',
  function (req: ICustomRequest, _res: IResponse, next: () => void) {
    // From root dir:
    req.swaggerDoc = YAML.load(path.join(__dirname, './swagger.yaml'))
    next()
  },
  swaggerUi.serve,
  swaggerUi.setup()
)

export const swagger = swaggerApi
