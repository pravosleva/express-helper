enum EMessageType {
  Info = 'info',
  Success = 'success',
  Warn = 'warning',
  Danger = 'danger',
  Dead = 'dead',
  Done = 'done',
}
type TMessage = { user: string; text: string; ts: number; editTs?: number; name: string, type: EMessageType }

export class Logic {
  messages: TMessage[];

  constructor(messages: TMessage[]) {
    this.messages = messages;
  }

  getFiltered(filter: EMessageType | null, searchText?: string): TMessage[] {
    switch (true) {
      case !!searchText:
        const words = searchText?.split(' ').filter((str: string) => !!str)

        if (!!filter) {
          // @ts-ignore
          // return this.messages.filter(({ type, text }) => type === filter && new RegExp(substrings.join("|")).test(string) text.toLowerCase().includes(searchText.toLowerCase()))
          return this.messages.filter(({ type, text }) => type === filter && new RegExp(words.join("|")).test(text))
        } else {
          // @ts-ignore
          return this.messages.filter(({ text }) => new RegExp(words.join("|")).test(text))
        }
      case !!filter: return this.messages.filter(({ type }) => type === filter)
      default: return this.messages
    }
  }
  getCountByFilter(filter: EMessageType | null): number {
    switch (true) {
      case !!filter: return this.messages.filter(({ type }) => type === filter).length
      default: return this.messages.length
    }
  }
}
