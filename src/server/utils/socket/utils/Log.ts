import { Socket } from 'socket.io'
import { Counter } from '~/utils/counter'
import axios from 'axios'

const tgBotApiUrl = process.env.PRAVOSLEVA_BOT_2021_NOTIFY_BASE_URL || ''
const logCounter = Counter()
const reportCounter = Counter()

export class Log {
  isDev: boolean
  constructor ({ isDev }: { isDev: boolean }) {
    console.log('isDev', isDev)
    this.isDev = isDev
  }
  log(descr: string, value: any) {
    try {
      if (this.isDev) {
        console.log(`- ${logCounter.next().value} ${descr} -`)
        console.log(value)
        console.log('-')
      } else {
        console.log('!isDev')
      }
    } catch (err) {
      console.log(err)
    }
  }
  socket(id: string, socket: Socket) {
    console.log(`--- ${id} ---`)

    this.log('socket.id', socket.id)
    this.log('socket.rooms', socket.rooms)
    this.log('socket.nsp', socket.nsp)
    this.log('socket.nsp.adapter.rooms.get(socket.id)', socket.nsp.adapter.rooms.get(socket.id))
    // ALSO:
    // socket.nsp.adapter.rooms.get('ux-test')

    console.log('---')
  }
  sendDevTgReport({
    title,
    md,
  }: {
    title: string;
    md: string;
  }) {
    axios
      .post(`${tgBotApiUrl}/kanban-2021/reminder/send`, {
        resultId: reportCounter.next().value,
        chat_id: 432590698, // NOTE: Den Pol
        ts: new Date().getTime(),
        eventCode: 'aux_service',
        about: title,
        targetMD: md,
      })
      .then((res) => res.data)
      .catch((err) => err)
  }
}
