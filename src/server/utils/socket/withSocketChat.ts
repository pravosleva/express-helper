import { instrument } from '@socket.io/admin-ui'
import { Socket } from 'socket.io'
import { addUser, getUser, deleteUser, getUsers } from './users'

export const withSocketChat = (io: Socket) => {
  io.on('connection', (socket) => {
    socket.on('login', ({ name, room }, callback) => {
        const { user, error } = addUser({ socketId: socket.id, name, room })
        if (error) return callback(error)
        socket.join(user.room)
        socket.in(room).emit('notification', { status: 'info', title: 'Someone\'s here', description: `${user.name} just entered the room` })
        io.in(room).emit('users', getUsers(room))
        callback()
    })

    socket.on('sendMessage', message => {
        const user = getUser(socket.id)
        try {
          io.in(user.room).emit('message', { user: user.name, text: message });
        } catch (err) {
          socket.emit('notification', { status: 'error', title: 'ERR', description: err.message || 'Server error' })
        }
    })

    socket.on("disconnect", () => {
        console.log("User disconnected");
        const user = deleteUser(socket.id)
        if (user) {
          io.in(user.room).emit('notification', { status: 'info', title: 'Someone disconnected', description: `${user.name} just disconnected` })
          io.in(user.room).emit('users', getUsers(user.room))
        }
    })
  })

  // @ts-ignore
  instrument(io, {
    auth: false,
    // namespace: '/admin',
  })
}