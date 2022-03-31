import { readdirSync } from 'fs'

export const getFiles = (source: string): string[] =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => !dirent.isDirectory())
    .map(dirent => dirent.name)
