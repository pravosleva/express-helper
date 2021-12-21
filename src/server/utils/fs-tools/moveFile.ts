import fs from 'fs'

const copy = (oldPath: string, newPath: string, callback: (err?: any) => void) => {
  const readStream = fs.createReadStream(oldPath)
  const writeStream = fs.createWriteStream(newPath)

  readStream.on('error', callback)
  writeStream.on('error', callback)

  readStream.on('close', function () {
    fs.unlink(oldPath, callback)
  })

  readStream.pipe(writeStream)
}

export const moveFile = function move(oldPath: string, newPath: string, callback: (err?: any) => void) {
  fs.rename(oldPath, newPath, function (err) {
    if (err) {
      if (err.code === 'EXDEV') {
        copy(oldPath, newPath, callback)
      } else {
        callback(err)
      }
      return
    }
    callback()
  })
}
