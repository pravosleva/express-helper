import fs from 'fs'

export const writeStaticJSONAsync = (storageFilePath: string, newJSON: { [key: string]: any }) => {
  fs.writeFile(storageFilePath, JSON.stringify(newJSON), 'utf8', (err) => {
    if (!!err) console.log(err)
  })
}