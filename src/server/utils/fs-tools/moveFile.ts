import fs from 'fs'
import fsExtra from 'fs-extra'

const copy = (oldPath: string, newPath: string, callback: (err?: any) => void) => {
  try {
    const readStream = fs.createReadStream(oldPath)
    const writeStream = fs.createWriteStream(newPath)

    readStream.on('error', callback)
    writeStream.on('error', callback)

    readStream.on('close', function () {
      fs.unlink(oldPath, callback)
    })

    readStream.pipe(writeStream)
  } catch (err) {
    callback(err)
  }
}

export const moveFile = (oldPath: string, newPath: string, callback: (err?: any) => void) => {
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

export const moveFileIfExists = (oldPath: string, newPath: string, callback: (err?: any) => void) => {  
  const isFileExists = fs.existsSync(oldPath)

  if (isFileExists) {
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
  } else {
    callback(new Error('File does not exists'))
  }
}

export const moveFileSync = (oldPath: string, newPath: string, callback: (err?: any) => void) => {
  fsExtra.move(oldPath, newPath, function (err) {
    if (err) return callback(err)
    callback()
  })
}