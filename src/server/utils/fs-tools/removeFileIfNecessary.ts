import fs from 'fs'

export const removeFileIfNecessary = (storagePath: string): void => {
  const isStorageFileExists = fs.existsSync(storagePath)

  if (isStorageFileExists) {
    try {
      // fs.appendFileSync(storagePath, `{"data":{},"ts":${ts}}`, 'utf8')
      fs.unlink(storagePath, (err) => {
        console.log(err)
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
    }
  }
}