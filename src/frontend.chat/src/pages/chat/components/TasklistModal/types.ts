export type TTask = {
  title: string
  description?: string
  ts: number
  isCompleted: boolean

  // NOTE: New feature - auto uncheck looper
  isLooped?: boolean
  checkTsList?: number[]
  uncheckTsList?: number[]
  fixedDiff?: number
  price?: number
}