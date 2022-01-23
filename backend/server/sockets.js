import sio from 'socket.io'

import log from './utils/logger'
import plans from './plans'

function sockets(httpServer) {
    const server = sio(httpServer)

    server.on('connection', socket => {
        log.info(`Welcome user "${socket.id}"`)
        socket.emit('welcome')
    
        plans.connectUser(socket)
    })
}

export default sockets
