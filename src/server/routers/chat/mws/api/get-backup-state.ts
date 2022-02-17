import { Request, Response } from 'express'
import { cronStateInstance } from '~/utils/fs-tools/cronStateInstance'
// import { getStaticJSONSync } from '~/utils/fs-tools'
// import path from 'path'

// const projectRootDir = path.join(__dirname, '../../../../')
// const BACKUP_STATE_FILE_NAME = process.env.BACKUP_STATE_FILE_NAME || 'backup-state.json'
// const backupStateFilePath = path.join(projectRootDir, '/backup', BACKUP_STATE_FILE_NAME)

export const getBackupState = (req: Request, res: Response) => {
  // const _staticData = getStaticJSONSync(backupStateFilePath)

  try {
    const state = cronStateInstance.getState()

    return res.status(200).send({
      ok: true,
      state,
      _originalQuery: req.query,
    })
  } catch (err) {
    return res.status(200).send({
      ok: false,
      message: err.message,
      _originalQuery: req.query,
    })
  }
}
