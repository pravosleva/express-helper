import fs from 'fs'

export const createDirIfNecessary = (dir: string): void => {
  if (!fs.existsSync(dir)){
    try {
      fs.mkdirSync(dir);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      throw err
    }
  }
}
