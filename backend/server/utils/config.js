let conf = {}

if (process.env.NODE_ENV === 'development') {
    conf = require('../../conf.dev.json')
}
else {
    conf = require('../../../conf.prod.json')
}

export default conf
