import express, { Express as IExpress } from 'express'
import { getModels } from './get-models'

const caseServiceApi: IExpress = express()

caseServiceApi.get('/get-models', getModels)

export { caseServiceApi }
