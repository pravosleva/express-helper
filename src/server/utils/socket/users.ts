const users = []

export const addUser = ({ socketId, name, room }) => {
    const existingUser = users.find(user => user.name.trim().toLowerCase() === name.trim().toLowerCase())

    if (existingUser) return { error: "Username has already been taken" }
    if (!name && !room) return { error: "Username and room are required" }
    if (!name) return { error: "Username is required" }
    if (!room) return { error: "Room is required" }

    const user = { socketId, name, room }
    users.push(user)
    return { user }
}

export const getUser = (socketId: string) => {
    let user = users.find(user => user.socketId == socketId)
    return user
}

export const deleteUser = (socketId: string) => {
    const index = users.findIndex((user) => user.socketId === socketId);
    if (index !== -1) return users.splice(index, 1)[0];
}

export const getUsers = (room: string) => users.filter(user => user.room === room)
