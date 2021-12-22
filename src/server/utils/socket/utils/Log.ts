import { Socket } from 'socket.io'
import { Counter } from '~/utils/counter'

const counter = Counter()

export class Log {
  isDev: boolean
  constructor (isDev: boolean) {
    console.log('isDev', isDev)
    this.isDev = isDev
  }
  log(descr: string, value: any) {
    try {
      if (this.isDev) {
        console.log(`- ${counter.next().value} ${descr} -`)
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
}
