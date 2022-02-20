import { Request, Response } from 'express'
import { cronStateInstance } from '~/utils/cron/cronStateInstance'
// import { getStaticJSONSync } from '~/utils/fs-tools'
// import path from 'path'
import { getTimeAgo } from '~/utils/getTimeAgo'

// const projectRootDir = path.join(__dirname, '../../../../')
// const BACKUP_STATE_FILE_NAME = process.env.BACKUP_STATE_FILE_NAME || 'backup-state.json'
// const backupStateFilePath = path.join(projectRootDir, '/backup', BACKUP_STATE_FILE_NAME)

export const getBackupState = (req: Request, res: Response) => {
  // const _staticData = getStaticJSONSync(backupStateFilePath)
  const { lock } = req.query

  try {
    const state = cronStateInstance.getState()

    let _targetLatestTime = new Date(1995, 11, 17).getTime();
    let latestLockedBackup = null

    for (const backupName in state) {
      if (state[backupName].ts >= _targetLatestTime) {
        _targetLatestTime = state[backupName].ts
        latestLockedBackup = backupName
      }
    }

    if (!!latestLockedBackup) {
      const extraInfo: any = {
        isLatestLocked: false
      }

      if (lock === '1') {
        const lockedBackup = cronStateInstance.lock(latestLockedBackup)

        if (lockedBackup) {
          extraInfo.isLatestLocked = true
          extraInfo.lockedBackup = lockedBackup
        }
      }

      return res.status(200).send({
        ok: true,
        state,
        latest: {
          backupName: latestLockedBackup,
          data: state[latestLockedBackup],
          message: getTimeAgo(_targetLatestTime),
        },
        extraInfo,
        _originalQuery: req.query,
      })
    } else {
      return res.status(200).send({
        ok: false,
        state,
        message: 'ERR: latestLockedBackup not detected',
        _originalQuery: req.query,
      })
    }
  } catch (err) {
    return res.status(200).send({
      ok: false,
      message: err.message,
      _originalQuery: req.query,
    })
  }
}
