import sio from 'socket.io-client'

import config from 'utils/config'

export async function connect() {
    return new Promise((resolve, reject) => {
        const socket = sio.connect(config.ServerUrl)

        socket.once('connect', () => {
            resolve(socket)
        })
    })
}
