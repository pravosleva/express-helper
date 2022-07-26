import fs from 'fs'

export const createFileIfNecessary = (storagePath: string, initialContent?: string): void => {
  const isStorageFileExists = fs.existsSync(storagePath)

  if (!isStorageFileExists) {
    const ts = new Date().getTime()
    try {
      fs.appendFileSync(storagePath, initialContent || `{"data":{},"ts":${ts}}`, 'utf8')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      throw err
    }
  }
}
