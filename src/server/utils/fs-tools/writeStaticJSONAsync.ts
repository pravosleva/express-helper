import fs from 'fs'

export const writeStaticJSONAsync = (storageFilePath: string, newJSON: { [key: string]: any }, shouldBeHumanized?: boolean) => {
  if (shouldBeHumanized) {
    fs.writeFile(storageFilePath, JSON.stringify(newJSON, null, 2), 'utf8', (err) => {
      if (!!err) console.log(err)
    })
  } else {
    fs.writeFile(storageFilePath, JSON.stringify(newJSON), 'utf8', (err) => {
      if (!!err) console.log(err)
    })
  }
}
