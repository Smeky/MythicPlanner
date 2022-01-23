import passport from 'passport'
import bcrypt from 'bcrypt'
import express from 'express'
const router = express.Router()

import log from '../utils/logger'
import UserModel from '../models/userModel'

router.post('/register', (req, res, next) => {
    if (!req.body.email || !req.body.username || !req.body.password) {
        log.warn(`Invalid registration request ${req.body.email} ${req.body.username} (pwd not displayed)`)
        return res.status(400).json({
            reason: 'Invalidat registration params, some fields are missing'
        })
    }

    bcrypt.hash(req.body.password, 10).then(hash => {
        const data = {
            email: req.body.email,
            username: req.body.username,
            password: hash
        }

        UserModel.create(data, (err, user) => {
            if (err) {
                log.error(`Failed to register user: ${req.body.email}`)

                next(err)
            } else {
                log.info(`Registered new user ${req.body.username} : ${req.body.email}`)

                return res.json({
                    success: true
                })
            }
        })
    })
})

router.post('/login', passport.authenticate('local'), (req, res) => {
    log.info(`User login ${req.user.email}`)
    res.json({
        username: req.user.username
    })
})

router.get('/logout', (req, res) => {
    log.info(`User logout ${req.user.email}`)
    req.logout()
    res.end()
})

router.get('/check', (req, res) => {
    const auth = req.isAuthenticated()

    if (req.user) {
        log.info(`User check auth ${req.user.email} => ${auth}`)
    }

    res.json({
        loggedIn: auth,
        username: auth ? req.user.username : null
    })
})

export default router
