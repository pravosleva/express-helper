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

  getFiltered(filter: EMessageType | null): TMessage[] {
    switch (true) {
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
