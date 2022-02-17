import cron from 'node-cron'
import { ncp } from 'ncp'
import fs from 'fs'
import { createDirIfNecessary } from './createDirIfNecessary'
import path from 'path'

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
    
                    console.log(`✅ BACKUP: ${dirName}`)
                });
            }
        })
    })
})
