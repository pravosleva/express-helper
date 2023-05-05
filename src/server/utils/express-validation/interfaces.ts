export type THelp = {
  params: {
    body?: {
      [key: string]: {
        type: string
        descr: string
        required: boolean
        validate: (val: any) => ({
          ok: boolean
          reason?: string
          _reponseDetails?: {
            status: number
            _addProps?: {
              [key: string]: any
            }
          }
        })
      }
    }
    query?: {
      [key: string]: {
        type: string
        descr: string
        required: boolean
        validate: (val: any) => ({
          ok: boolean
          reason?: string
          _reponseDetails?: {
            status: number
            _addProps?: {
              [key: string]: any
            }
          }
        })
      }
    }
  }
  res?: {
    [key: string]: any
  }
}
