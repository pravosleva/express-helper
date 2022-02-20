import fs from 'fs'
import path from 'path'

export const clearDirIfExists = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    try {
      fs.readdir(dir, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(dir, file), err => {
            if (err) throw err;
          });
        }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      throw err
    }
  }
}
