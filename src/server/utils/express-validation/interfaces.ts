export type THelp = {
  params: {
    body?: {
      [key: string]: {
        type: string
        descr: string
        required: boolean
        validate: (arg: any) => ({
          ok: boolean
          reason?: string
        })
      }
    }
    query?: {
      [key: string]: {
        type: string
        descr: string
        required: boolean
        validate: (arg: any) => ({
          ok: boolean
          reason?: string
        })
      }
    }
  }
  res?: {
    [key: string]: any
  }
}
