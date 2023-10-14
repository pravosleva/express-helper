import fs from 'fs'

export const removeFileIfNecessary = ({
  filePath,
  cb,
}: {
  filePath: string;
  cb?: {
    onSuccess: (_arg: any) => void;
    onError: (_arg: any) => void;
  };
}): void => {
  const isFileExists = fs.existsSync(filePath)

  if (isFileExists) {
    try {
      // fs.appendFileSync(storagePath, `{"data":{},"ts":${ts}}`, 'utf8')
      fs.unlink(filePath, (err) => {
        if (!!cb) {
          if (!!err) cb.onError(err)
          else cb.onSuccess(err)
        }
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      if (!!cb) cb.onError(err)
    }
  } else if (!!cb) cb.onError(new Error('File does not exists'))
}
