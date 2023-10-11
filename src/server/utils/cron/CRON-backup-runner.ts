import cron from 'node-cron'
// import { ncp } from 'ncp'
// import fs from 'fs'
import path from 'path'
// import { MakeLooper } from '~/utils/MakeLooper'
import { createPollingByConditions } from '~/utils/socket/state/createPollingByConditions'
import { Counter } from '~/utils/counter'
import merge from 'merge-deep'
import { createDirIfNecessary, getStaticJSONSync, createFileIfNecessary, writeStaticJSONAsync } from '~/utils/fs-tools'
import { cronStateInstance } from './cronStateInstance'
// import { clearDirIfExists } from '~/utils/fs-tools/clearDirIfExists'
import bashExec from 'bash-exec'
// import { homedir } from 'os'

const counter = Counter()

// ---
/* ATTENTION: Внимательнее к ключам в объекте cfg:
    В package.json должен быть соотв. скрипт
    Something like this:
"scripts": {
    "make-backup:backup-15min": "bash dir-copy.sh storage /backup/backup-15min",
} */
const cfg = {
    // 'backup-15min': '15,30,45,0 * * * *', // Every 15 min
    'backup-20min': '20,40,59 * * * *',
    // 'backup-1hour': '59 15 * * *', // Every day at 15:59
    // 'backup-24h': '2 1 * * *', // Every day at 01:02
    // 'backup-1month': '* * 20 * *', // Every 20 day of moth
    // 'backup-sun': '* * * Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec Sun', // Running on Sundays of all months
    // 'backup-2months': '* * * Jan,Mar,May,Jul,Sep,Nov *',
}
// ---

// const isDev = process.env.NODE_ENV === 'development'
// if (isDev) cfg['backup-1min'] = '*/1 * * * *'

const projectRootDir = path.join(__dirname, '../../../')
// const sourcePath = path.join(projectRootDir, 'storage')

const BACKUP_STATE_FILE_NAME = process.env.BACKUP_STATE_FILE_NAME || 'backup-state.json'
const backupStateFilePath = path.join(projectRootDir, './backup', BACKUP_STATE_FILE_NAME)

createDirIfNecessary(path.join(projectRootDir, 'backup'))

Object.keys(cfg).forEach((dirName, i) => {
  const destDir = path.join(projectRootDir, `backup/${dirName}`)
  createDirIfNecessary(destDir)

  const cronInterval = cfg[dirName]

  cron.schedule(cronInterval, function() {
    // NOTE: v2 (средствами bash)
    // See also: https://www.npmjs.com/package/bash-exec
    const runDir = path.join(__dirname, '../../../') // SAMPLE: /home/den/projects/smartprice_projects/express-helper/
    const cmd = `yarn --cwd ${runDir} make-backup:${dirName}`
    bashExec(cmd)
      .then((arg: any) => {
        console.log(`- backup ${dirName}: ok`)
        console.log(arg)
        cronStateInstance.setData({ backupName: dirName })
        console.log('-')
      })
      .catch((err: any) => {
        const lockedBackupName = dirName === 'backup-20min' ? 'backup-15min' : 'backup-20min'
        console.log(`- backup ${dirName}: fail; locked bacupName: ${lockedBackupName}`)
        console.log(err)
        cronStateInstance.lock(lockedBackupName)
        console.log('-')
      })
      /*
      fs.readdir(sourcePath, function(err, files) {
        if (err) {
          return console.error(err);
        }
        if (files.length === 0) {
          console.log('🚫 BACKUP: empty folder!')
        } else {
          // -- TEST:
          // cronStateInstance.lock('backup-1min')
          // --
          const locked = cronStateInstance.getLocked()

          switch (true) {
            case !!locked && locked === dirName:
              // Не перезаписываем директорию
              break;
            case !!locked && locked !== dirName:
              // NOTE: На самом деле, нет смысла сохранять другие бэкапы,
              // т.к. восстанавливать придется из залоченного бэкапа

              // = SKIP or CLEAR =
              console.log(`🚫 BACKUP2: SKIP ${dirName}`)
              // clearDirIfExists(path.join(projectRootDir, `backup/${dirName}`))
              // =

              // NOTE: v2 (For each file with validation) выборочно для содержимого директории
              // for (const filePath of files) {
              //     ncp(filePath, destDir, {
              //         filter: (file) => {
              //             // SAMPLES file:
              //             // /home/pravosleva/projects/smartprice_projects/express-helper/gcs-users.json
              //             // /home/pravosleva/projects/smartprice_projects/express-helper/uploads
              //             const exclude = ['uploads']
              //             return !exclude.includes(file.split('/').reverse()[0])
              //         }
              //     }, function(err) {
              //         if (!!err) {
              //             console.log(`🚫 BACKUP2: ERR ${dirName}`)
              //             console.log(err)
  
              //             createDirIfNecessary(path.join(projectRootDir, `backup/${dirName}`))
              //             return
              //         }

              //         cronStateInstance.setData({ backupName: dirName })
              //         console.log(`✅ BACKUP2: ${dirName}`)
              //     });   
              // }
              break;
            default:
              // NOTE: v1 для директории (средствами js)
              // ncp(sourcePath, destDir, function(err) {
              //     if (!!err) {
              //         console.log(`🚫 BACKUP: ERR ${dirName}`)
              //         console.log(err)

              //         createDirIfNecessary(path.join(projectRootDir, `backup/${dirName}`))
              //         return
              //     }

              //     cronStateInstance.setData({ backupName: dirName })
              //     console.log(`✅ BACKUP: ${dirName}`)
              // });
              break;
          }         
        }
    }) */
  })
})

const syncBackupState = () => {
    createFileIfNecessary(backupStateFilePath)

    const isFirstScriptRun = counter.next().value === 0

    let oldStatic: { data: { [key: string]: any }, ts: number, locked: string | null }
    try {
        oldStatic = getStaticJSONSync(backupStateFilePath)
        // console.log(oldStatic.data)
        if (!oldStatic?.data || !oldStatic.ts) throw new Error('#ERR20220217-15:49 Incorrect static data')
    } catch (err) {
        // TODO: Сделать нормальные логи
        console.log('ERR#CHAT-BACKUP-STATE')
        console.log(err)

        // --- NOTE: lock latest
        const lockedLatestBackup = cronStateInstance.lockLatest()
        if (!!lockedLatestBackup) console.log(`LOCKED BACKUP: ${lockedLatestBackup}`)

        // TODO: Отправить Денису в телегу "Плохие и хорошие новости! Бэкап ${lockedLatestBackup} пригодится")
        // ---

        oldStatic = { data: {}, ts: 0, locked: null }
    }
    const staticData: { [key: string]: { ts: number, descr: string } } = oldStatic.data
    const oldLocked: string | null = oldStatic.locked
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

    writeStaticJSONAsync(backupStateFilePath, { data: newStaticData, ts, locked: cronStateInstance.getLocked() || oldLocked || null }, true)
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
