import passport from 'passport'
import shortid from 'shortid'
import moment from 'moment'
import express from 'express'
const router = express.Router()

import log from '../utils/logger'
import middlewares from '../utils/middlewares'
import PlanModel from '../models/planModel'
import plans from '../plans'

const DungeonNames = {
    ataldazar:          'Atal\'Dazar',
    freehold:           'Freehold',
    kingsrest:          'King\'s Rest',
    motherlode:         'The MOTHERLODE!!',
    siegeofboralus:     'Siege of Boralus',
    shrineofthestorm:   'Shrine of the Storm',
    templeofsethraliss: 'Temple of Sethraliss',
    toldagor:           'Tol Dagor',
    underrot:           'The Underrot',
    waycrestmanor:      'Waycrest Manor'
}

function isDungeonValid(id) {
    switch(id) {
        case 'ataldazar': return true; break
        case 'freehold': return true; break
        case 'kingsrest': return true; break
        case 'motherlode': return true; break
        case 'siegeofboralus': return true; break
        case 'shrineofthestorm': return true; break
        case 'templeofsethraliss': return true; break
        case 'toldagor': return true; break
        case 'underrot': return true; break
        case 'waycrestmanor': return true; break
        default: return false; break
    }
}

router.post('/create', middlewares.requireAuth, (req, res) => {
    if (!req.body.dungId || !isDungeonValid(req.body.dungId)) {
        log.warn('Failed to create plan due to invalid ID,', req.body.dungId)
        return res.status(400).json({
            reason: 'Invalid dungeon ID.'
        })
    }

    const id = shortid.generate()

    PlanModel
        .create({ 
            _id: id,
            user: req.user._id,
            created: new Date(),
            dungId: req.body.dungId,
            affixes: (moment().subtract(3, 'days').week() + 4) % 12
        })
        .catch(err => {
            log.error(`Failed to create plan "${req.body.dungId}", err: ${err}`)
            res.sendStatus(500)
        })
        .then(() => {
            log.info(`Created plan "${req.body.dungId}", id ${id}`)
            res.json({ planId: id })
        })
})

router.get('/exists', middlewares.requireAuth, (req, res) => {
    if (!req.query.planId) {
        log.warn('Failed to check if plan exists due to invalid plan ID,', req.query.planId)
        return res.status(400).json({
            reason: 'Invalid plan ID.'
        })
    }

    PlanModel.count({ _id: req.query.planId }, (err, count) => {
        if (err) {
            log.error('Failed to count plans, err:', err)
            return res.sendStatus(500)
        }
        else if (count === 0) {
            return res.status(404).json({ reason: 'Plan does not exist' })
        }

        return res.json({ exists: count > 0 })
    })
})

router.get('/collection', middlewares.requireAuth, (req, res) => {
    PlanModel.find({ user: req.user._id }, ['_id', 'created', 'dungId', 'affixes'], (err, docs) => {
        if (err) {
            log.error('Failed to fetch plan collection, err:', err)
            return res.sendStatus(500)
        }

        res.json(docs.map(entry => ({
            ...entry._doc,
            name: DungeonNames[entry.dungId]
        })))
    })
})

router.get('/list', middlewares.requireAuth, (req, res) => {
    res.json({
        expansion: 'BFA',
        dungeons: [
            { id: 'ataldazar',          name: DungeonNames['ataldazar'] },
            { id: 'freehold',           name: DungeonNames['freehold'] },
            { id: 'kingsrest',          name: DungeonNames['kingsrest'] },
            { id: 'motherlode',         name: DungeonNames['motherlode'] },
            { id: 'siegeofboralus',     name: DungeonNames['siegeofboralus'] },
            { id: 'shrineofthestorm',   name: DungeonNames['shrineofthestorm'] },
            { id: 'templeofsethraliss', name: DungeonNames['templeofsethraliss'] },
            { id: 'toldagor',           name: DungeonNames['toldagor'] },
            { id: 'underrot',           name: DungeonNames['underrot'] },
            { id: 'waycrestmanor',      name: DungeonNames['waycrestmanor'] }
        ]
    })
})

router.delete('/delete', middlewares.requireAuth, (req, res) => {
    log.info(`Deleting plan ${req.body.id}`)

    // Todo: Handle this better, it's fragile
    //          - Maybe "mark" plan for closure to pause socket communication
    //            and then remove/resume based on result of the mongo remove
    plans.closePlan(req.body.id)
    PlanModel.findByIdAndRemove(req.body.id, (err) => {
        if (err) {
            log.error(err)
            res.sendStatus(500)
        }
        else {
            log.info(`Successfully delete plan ${req.body.id}`)
            res.sendStatus(200)
        }
    })
})

export default router
