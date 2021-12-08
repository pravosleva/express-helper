import {
  TMessage,
  EMessageStatus,
  TImageLightboxFormat,
} from '~/utils/interfaces'

const REACT_APP_CHAT_UPLOADS_URL = process.env.REACT_APP_CHAT_UPLOADS_URL || '/chat/storage/uploads'

export class Logic {
  messages: TMessage[];

  constructor(messages: TMessage[]) {
    this.messages = messages;
  }

  getFiltered({ filters, searchText, additionalTsToShow }: { filters: EMessageStatus[], searchText?: string, additionalTsToShow: number[] }): TMessage[] {
    const result: TMessage[] = []

    switch (true) {
      case !!searchText:
        const words = searchText?.toLowerCase().split(' ').filter((str: string) => !!str)

        if (filters.length > 0) {
          // V1:
          // return this.messages.filter(({ status, text, ts }) => filters.includes(status) && (!!words ? new RegExp(words.join("|")).test(text) : true) || additionalTsToShow.includes(ts))
          // V2: For Next one btn
          this.messages.forEach((msg, i, arr) => {
            const { status, text, ts } = msg
            if (filters.includes(status) && (!!words ? new RegExp(words.join("|"), 'gi').test(text.toLowerCase()) : true) || additionalTsToShow.includes(ts)) {
              const modifiedMsg: any = { ...msg }
              const isLast = i === arr.length - 1

              if (!isLast) {
                const nextMsg = this.messages[i + 1]
                const isNextHidden = !(filters.includes(nextMsg.status) && (!!words ? new RegExp(words.join("|"), 'gi').test(nextMsg.text.toLowerCase()) : true) || additionalTsToShow.includes(nextMsg.ts))

                modifiedMsg._next = { ts: this.messages[i + 1].ts, isHidden: isNextHidden }
              }

              result.push(modifiedMsg)
            }
          })

          return result
        } else {
          // @ts-ignore
          // V1:
          // return this.messages.filter(({ text }) => new RegExp(words.join("|")).test(text.toLowerCase()))
          this.messages.forEach((msg, i, arr) => {
            const { text, ts } = msg
            if (!!words && new RegExp(words.join("|")).test(text.toLowerCase()) || additionalTsToShow.includes(ts)) {
              const modifiedMsg: any = { ...msg }
              const isLast = i === arr.length - 1

              if (!isLast) {
                const nextMsg = this.messages[i + 1]
                const isNextHidden = !((!!words ? new RegExp(words.join("|")).test(nextMsg.text.toLowerCase()) : false) || additionalTsToShow.includes(nextMsg.ts))

                modifiedMsg._next = { ts: this.messages[i + 1].ts, isHidden: isNextHidden }
              }

              result.push(modifiedMsg)
            }
          })

          return result
        }
      // V1:
      // case filters.length > 0: return this.messages.filter(({ status }) => filters.length > 0 ? filters.includes(status) : true)
      // V2:
      case filters.length > 0:
        this.messages.forEach((msg, i, arr) => {
          const { status, ts } = msg
          if (filters.includes(status) || additionalTsToShow.includes(ts)) {
            const modifiedMsg: any = { ...msg }
            const isLast = i === arr.length - 1

            if (!isLast) {
              const nextMsg = this.messages[i + 1]
              const isNextHidden = !additionalTsToShow.includes(nextMsg.ts) && !filters.includes(nextMsg.status)

              modifiedMsg._next = { ts: this.messages[i + 1].ts, isHidden: isNextHidden }
            }

            result.push(modifiedMsg)
          }
        })

        return result
      default: return this.messages
    }
  }
  getCountByFilter(filter: EMessageStatus | null): number {
    switch (true) {
      case !!filter: return this.messages.filter(({ status }) => status === filter).length
      default: return this.messages.length
    }
  }
  getCountByFilters(filters: EMessageStatus[]): number {
    switch (true) {
      case filters.length > 0: return this.messages.filter(({ status }) => filters.includes(status)).length
      default: return this.messages.length
    }
  }
  getAllImagesMessages(): TMessage[] {
    return this.messages.filter(({ fileName }) => !!fileName)
  }
  getAllImagesLightboxFormat(): TImageLightboxFormat[] {
    const result: { src: string, alt: string }[] = []

    this.messages.forEach(({ fileName, text }) => {
      if (!!fileName) result.push({ src: `${REACT_APP_CHAT_UPLOADS_URL}/${fileName}`, alt: text })
    })

    return result
  }
}
