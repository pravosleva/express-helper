import cron from 'node-cron'
import { ncp } from 'ncp'
import fs from 'fs'
import { createDirIfNecessary } from './createDirIfNecessary'
import path from 'path'
import { cronStateInstance } from './cronStateInstance'
// import { MakeLooper } from '~/utils/MakeLooper'
import { createPollingByConditions } from '~/utils/socket/state/createPollingByConditions'
import { Counter } from '~/utils/counter'
import { createFileIfNecessary } from '~/utils/fs-tools/createFileIfNecessary'
import { getStaticJSONSync } from './getStaticJSONSync'
import merge from 'merge-deep'
import { writeStaticJSONAsync } from './writeStaticJSONAsync'

const counter = Counter()

const cfg = {
    'backup-15min': '15,30,45,59 * * * *', // Every 15 min
    'backup-1hour': '59 15 * * *', // Every day at 15:59
    'backup-24h': '2 1 * * *', // Every day at 01:02
    'backup-1week': '59 1 * * Mon', // Every Mon at 01:59
    'backup-1month': '* * 20 * *', // Every 20 day of moth
    'backup-sun': '* * * Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec Sun', // Running on Sundays of all months
    'backup-2months': '2 1 3 Jan,Mar,May,Jul,Sep,Nov *', // Running on 3day of all diff months at 1:02
}
const projectRootDir = path.join(__dirname, '../../../')
const sourcePath = path.join(projectRootDir, 'storage')

const BACKUP_STATE_FILE_NAME = process.env.BACKUP_STATE_FILE_NAME || 'backup-state.json'
const backupStateFilePath = path.join(projectRootDir, '/backup', BACKUP_STATE_FILE_NAME)

createDirIfNecessary(path.join(projectRootDir, 'backup'))

Object.keys(cfg).forEach((dirName, i) => {
    createDirIfNecessary(path.join(projectRootDir, `backup/${dirName}`))

    const cronInterval = cfg[dirName]
    const destDir = path.join(projectRootDir, `backup/${dirName}`)

    cron.schedule(cronInterval, function() {
        fs.readdir(sourcePath, function(err, files) {
            if (err) {
                return console.error(err);
            }
            if (files.length === 0) {
                console.log('🚫 BACKUP: empty folder!')
            } else {
                // console.log(files)
                ncp(sourcePath, destDir, function(err) {
                    if (!!err) {
                        console.log(`🚫 BACKUP: ERR ${dirName}`)
                        console.log(err)

                        createDirIfNecessary(path.join(projectRootDir, `backup/${dirName}`))

                        return
                    }

                    cronStateInstance.setData({ backupName: dirName })
                    console.log(`✅ BACKUP: ${dirName}`)
                });
            }
        })
    })
})

const syncBackupState = () => {
    createFileIfNecessary(backupStateFilePath)

    const isFirstScriptRun = counter.next().value === 0

    let oldStatic: { data: { [key: string]: any }, ts: number }
    try {
        oldStatic = getStaticJSONSync(backupStateFilePath)
        // console.log(oldStatic.data)
        if (!oldStatic?.data || !oldStatic.ts) throw new Error('#ERR20220217-15:49 Incorrect static data')
    } catch (err) {
        // TODO: Сделать нормальные логи
        console.log('ERR#CHAT-BACKUP-STATE')
        console.log(err)
        oldStatic = { data: {}, ts: 0 }
    }
    const staticData: { [key: string]: { ts: number, descr: string } } = oldStatic.data
    const ts = new Date().getTime()

    if (isFirstScriptRun) {
        // NOTE: Sync with old state:
        Object.keys(staticData).forEach((name: string) => {
          const modifiedState: { ts: number, descr: string } = staticData[name]
          
          cronStateInstance.set(name, modifiedState)
        })
    }

    const currentBackupState: { [key: string]: { ts: number, descr: string } } = [...cronStateInstance.keys()].reduce((acc, backupName: string) => { acc[backupName] = cronStateInstance.get(backupName); return acc }, {})
    const newStaticData = merge(staticData, currentBackupState)

    writeStaticJSONAsync(backupStateFilePath, { data: newStaticData, ts })
}

createPollingByConditions({
    cb: () => {
      console.log('cb called')
    },
    interval: 60000,
    callbackAsResolve: () => {
      syncBackupState()
    },
    toBeOrNotToBe: () => true, // Need to retry again
    callbackAsReject: () => {
      console.log('NOWHERE')
    },
})
