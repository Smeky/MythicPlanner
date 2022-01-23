import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs'
import helmet from 'helmet'
import path from 'path'
import bcrypt from 'bcrypt'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import session from 'express-session'
import connectMongo from 'connect-mongo'
import passport from 'passport'
import passportLocal from 'passport-local'

import config from './utils/config'
import log from './utils/logger'
import sockets from './sockets'
import { authRouter, planRouter } from './routers'

import UserModel from './models/userModel'

const MongoStore = connectMongo(session)

const app = express()

mongoose.connect(`${config.MongoUrl}/${config.MongoDbName}`)

passport.use(new passportLocal.Strategy(
    { usernameField: 'email' },
    (email, password, done) => {
        UserModel.findOne({ email }, (err, user) => {
            if (err) {
                log.error(err)
                return done(err)
            }
            else if (!user) {
                log.info(`Failed to authenticate user ${email}. User not found`)
                const error = new Error('User not found')
                error.status = 401
                return done(error)
            }
    
            bcrypt.compare(password, user.password).then(res => {
                if (res) {
                    return done(null, user)
                }
                else {
                    log.info(`Failed to authenticate user ${email}. Incorrect password`)
                    return done()
                }
            })
        })
    }
))

passport.serializeUser((user, done) => {
    done(null, user._id);
});
  
passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
        done(err, user)
    })
});


app.use(helmet())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(session({
    secret: config.SessionSecret,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}))
app.use(passport.initialize())
app.use(passport.session())

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", config.AccessOriginUrl)
        res.header("Access-Control-Allow-Credentials", true)
        res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE")
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        next();
    });
}
else {
    app.use(express.static(path.join(__dirname, '../../../frontend/build')))
}

app.use('/api/auth', authRouter)
app.use('/api/plan', planRouter)

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/build', 'index.html'))
})

let server = null

if (process.env.NODE_ENV === 'development') {
    server = http.createServer(app)
}
else {
    server = https.createServer({
        cert: fs.readFileSync(config.ServerCert),
        key: fs.readFileSync(config.ServerCertKey)
    }, app)
}

sockets(server)
server.listen(config.ServerPort, () => {
    log.info('App listening on port ' + config.ServerPort)
})
