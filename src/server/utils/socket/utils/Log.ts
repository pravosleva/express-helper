import { Socket } from 'socket.io'
import { Counter } from '~/utils/counter'

const counter = Counter()

export class Log {
  isDev: boolean
  constructor (isDev: boolean) {
    this.isDev = isDev
  }
  socket(id: string, socket: Socket) {
    if (this.isDev) {
      try {
        console.log(`--- ${id} ---`)
        console.log(`- ${counter.next().value} socket.id -`)
        console.log(socket.id)
        console.log('-')
        console.log(`- ${counter.next().value} socket.rooms -`)
        console.log(socket.rooms)
        console.log('-')
        console.log(`- ${counter.next().value} socket.nsp -`)
        console.log(socket.nsp)
        console.log('-')
        console.log(`- ${counter.next().value} socket.nsp.adapter.rooms.get(socket.id) -`)
        // ALSO:
        // socket.nsp.adapter.rooms.get('ux-test')
        console.log(socket.nsp.adapter.rooms.get(socket.id))
        console.log('-')
        console.log('---')
      } catch (err) {
        console.log(err)
      }
    }
  }
}
