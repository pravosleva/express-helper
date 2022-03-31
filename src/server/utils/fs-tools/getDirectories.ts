import { readdirSync } from 'fs'
// NOTE: https://stackoverflow.com/questions/18112204/get-all-directories-within-directory-nodejs

export const getDirectories = (source: string): string[] =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)