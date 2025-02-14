import express, { Response as IResponse, NextFunction as INextFunction } from 'express'
import { TModifiedRequest } from './types'
import { createFileIfNecessary } from '~/utils/fs-tools/createFileIfNecessary'
import { getFiles, writeStaticJSONAsync } from '~/utils/fs-tools'
import path from 'path'

import { withReqParamsValidationMW } from '~/utils/express-validation/withReqParamsValidationMW'
import { getItem as getAuxStateItem, rules as getAuxStateItemRules } from './[tg_chat_id]/get-item'
import { saveItem as saveAuxStateItem, rules as saveAuxStateItemRules } from './[tg_chat_id]/save-item'
import { replaceAuditItem as replaceAuxStateAuditItem, rules as replaceAuxStateAuditItemRules } from './[tg_chat_id]/replace-audit-item'
import { removeAuditItem as removeAuxStateAuditItem, rules as removeAuxStateAuditItemRules } from './[tg_chat_id]/remove-audit-item'
import { auditListAuxStateInstance, customLoopersSet } from './utils'
import { looperStart, rules as looperStartRules } from './looper.start'
import { looperStop, rules as looperStopRules } from './looper.stop'

// --- NOTE: Create storage files if necessary
const requiredAuxStateFiles = [
  'subprojects.audit-list.aux-state.json',
]
const getFileName = (namespace: string): string => `subprojects.${namespace}.aux-state.json`
export const getStorageNamespaceFilePath = (namespace: string): string => path.join(projectRootDir, '/storage', getFileName(namespace))
const projectRootDir = path.join(__dirname, '../../../../') // NOTE: root ./src как ориентир
for (const name of requiredAuxStateFiles) {
  const storageFilePath = path.join(projectRootDir, '/storage', name)
  const ts = new Date().getTime()
  createFileIfNecessary(storageFilePath, `{ "data": {}, "ts": ${ts} }`)
}
// NOTE: Check
const testedFileNames = getFiles(path.join(projectRootDir, '/storage'))
// console.log(testedFileNames)
// NOTE: Example ['.gitkeep', 'subprojects.audit-list.aux-state.json']
for (const requiredFileName of requiredAuxStateFiles) {
  if (!testedFileNames.includes(requiredFileName))
    throw new Error(`⛔ Could not be started: File "${requiredFileName}" doesnt exists!\nDouble check this in ${path.join(projectRootDir, '/storage')}`)
}
// ---

const router = express.Router()

const withHelpfulStuff = (req: TModifiedRequest, _res: IResponse, next: INextFunction) => {
  req.subprojects = {
    projectRootDir,
    auxStateFileNames: requiredAuxStateFiles,
    auxState: {
      auditList: auditListAuxStateInstance,
    },
    loopers: customLoopersSet,
  }
  next()
}
const checkStorageFileMW = (req: TModifiedRequest, res: IResponse, next: INextFunction) => {
  switch (true) {
    case !req.body.namespace:
      res.status(200).send({ ok: false, message: 'Namespace does not exists' })
      break
    case !req.subprojects.auxStateFileNames.includes(getFileName(req.body.namespace)):
      res.status(200).send({ ok: false, message: `Namespace "${req.body.namespace}" does not exists` })
      break
    default:
      next()
      break
  }
}

router.use(withHelpfulStuff)
// router.use(express.json({ limit: '50mb' }))
// router.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }))

// NOTE: AuditList
router.post(
  '/looper.start',
  withReqParamsValidationMW({
    rules: looperStartRules,
  }),
  checkStorageFileMW,
  looperStart,
)
router.post(
  '/looper.stop',
  withReqParamsValidationMW({
    rules: looperStopRules,
  }),
  checkStorageFileMW,
  looperStop,
)
router.post(
  '/:tg_chat_id/get-item',
  withReqParamsValidationMW({
    rules: getAuxStateItemRules,
  }),
  checkStorageFileMW,
  getAuxStateItem,
)
router.post(
  '/:tg_chat_id/save-item',
  withReqParamsValidationMW({
    rules: saveAuxStateItemRules,
  }),
  checkStorageFileMW,
  saveAuxStateItem,
)
router.post(
  '/:tg_chat_id/replace-audit-item',
  withReqParamsValidationMW({
    rules: replaceAuxStateAuditItemRules,
  }),
  checkStorageFileMW,
  replaceAuxStateAuditItem,
)
router.post(
  '/:tg_chat_id/remove-audit-item',
  withReqParamsValidationMW({
    rules: removeAuxStateAuditItemRules,
  }),
  checkStorageFileMW,
  removeAuxStateAuditItem,
)

export const auxStateRouter = router
