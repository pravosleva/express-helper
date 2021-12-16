export type TTask = {
  title: string
  description?: string
  ts: number
  isCompleted: boolean

  // NOTE: New feature - auto uncheck looper
  isLooped?: boolean
  checkTs?: number
  uncheckTs?: number
  fixedDiff?: number
  price?: number
}