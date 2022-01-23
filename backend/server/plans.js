import { createCanvas, Image } from 'canvas'

import log from './utils/logger'
import PlanModel from './models/planModel'

// Todo: Error handling for all mongo queries

class PlanInstance {
    constructor(id) {
        this.id = id
        this.users = []
        this.canvasLayers = []

        this.drawActionBuffer = []
        this.drawActionPoller = setInterval(() => {
            if (this.drawActionBuffer.length === 0) {
                return
            }

            this.users.forEach(user => {
                const actions = this.drawActionBuffer
                    .filter(action => action.sender !== user.id)
                    .map(action => ({
                        levelId: action.state.levelId,
                        shape: action.state.shape,
                        type: action.state.type,
                        color: action.state.color,
                        from: action.state.from,
                        to: action.state.to
                    }))

                if (actions.length !== 0) {
                    user.emit('plan-update', { 
                        name: 'draw.actions',
                        state: { actions } 
                    })
                }
            })

            this.drawActionBuffer = []
        }, 100)

        this.drawActionSaver = setInterval(() => {
            PlanModel.updateOne(
                { _id: this.id }, 
                { canvases: this.canvasLayers.map(layer => {
                    return {
                        _id: layer.levelId,
                        uri: layer.canvas.toDataURL()
                    }
                }) }
            ).exec()
        }, 1000)
    }

    async init() {
        return new Promise((resolve, reject) => {
            PlanModel.findById(this.id, { canvases: 1 }, (err, result) => {
                if (err) {
                    reject(err)
                }
    
                result.canvases.forEach(layer => {
                    const canvas = createCanvas(1000, 670)
                    const context = canvas.getContext('2d')
                    context.strokeStyle = "#df4b26"
                    context.lineJoin = "round"
                    context.lineWidth = 5
    
                    const image = new Image()
                    image.src = layer.uri
                    context.drawImage(image, 0, 0)
                    
                    this.canvasLayers.push({
                        levelId: layer._id,
                        canvas,
                        context
                    })
                })

                resolve()
            })
        })
    }

    close() {
        clearInterval(this.drawActionPoller)
        clearInterval(this.drawActionSaver)

        if (this.users.length > 0) {
            log.info(`Plan ${this.id} closing with users inside. Notifying about closure ..`)

            for (const user of this.users) {
                user.emit('plan-update', { name: 'plan.closed' })
            }

            this.users = []
        }

        PlanModel.updateOne(
            { _id: this.id }, 
            { canvases: this.canvasLayers.map(layer => ({
                _id: layer.levelId,
                uri: layer.canvas.toDataURL()
            })) }
        ).exec()
    }

    addUser(socket) {
        log.info(`User "${socket.id}" connected to plan instance "${this.id}"`)

        socket.on('plan-update', data => this.onPlanUpdate(socket, data))

        this.users.push(socket)

        PlanModel.findOne({ _id: this.id }, (err, res) => {
            let data = { 
                dungId: "",
                units: [] 
            }

            if (res) {
                data.dungId = res.dungId
                data.affixes = res.affixes
                data.units = res.units.map(e => ({ id: e._id, selected: e.selected }))
                data.notes = res.notes.map(note => ({ id: note._id, text: note.text, position: note.position, levelId: note.levelId }))
            }
            
            data.canvases = this.canvasLayers.map(layer => ({
                levelId: layer.levelId,
                uri: layer.canvas.toDataURL()
            }))

            socket.emit('plan-joined', data)
        })
    }

    removeUser(id) {
        log.info(`Disconnecting user "${id}" from instance "${this.id}"`)

        const len = this.users.length

        this.users = this.users.filter(e => e.id !== id)

        return len !== this.users.length
    }

    hasUser(id) {
        return this.users.find(e => e.id === id) !== undefined
    }

    count() {
        return this.users.length
    }

    emitPlanUpdate(sender, name, state) {
        this.users.forEach(user => {
            if (user.id !== sender.id) {
                user.emit('plan-update', { name, state })
            }
        })
    }

    onPlanUpdate(user, data) {
        const { name, state } = data

        if (!name || !state) {
            log.warn(`Invalid plan update named "${name}", state: "${state}"`)
            return
        }

        switch(name) {
            case 'unit.select': this.updUnitSelect(user, state); break;
            case 'note.add': this.updNoteAdd(user, state); break;
            case 'note.remove': this.updNoteRemove(user, state); break;
            case 'note.update': this.updNoteUpdate(user, state); break;
            case 'note.move': this.updNoteMove(user, state); break;
            case 'draw.actions': this.updDrawActions(user, state); break;
            case 'draw.clearlayer': this.updDrawClearLayer(user, state); break;
            case 'aff.change': this.updAffixChange(user, state); break;
            default: break;
        }
    }

    updUnitSelect(user, state) {
        PlanModel.findById(this.id, { units: 1 }, (err, res) => {
            if (!res) return // Todo: an error if none was found?

            state.units.forEach(unit => {
                const stored = res.units.find(u => u._id === unit.id)

                if (stored) {
                    stored.selected = unit.selected
                }
                else {
                    res.units.push({
                        _id: unit.id,
                        selected: unit.selected
                    })
                }
            })

            res.save()
        })
        
        this.emitPlanUpdate(user, 'unit.select', state)
    }

    updNoteAdd(user, state) {
        PlanModel.updateOne(
            { _id: this.id }, 
            { $push: { notes: { _id: state.id, position: state.position, text: state.text, levelId: state.levelId } } }
        ).exec()

        this.emitPlanUpdate(user, 'note.add', state)
    }

    updNoteRemove(user, state) {
        PlanModel.updateOne(
            { _id: this.id }, 
            { $pull: { notes: { _id: state.id } } }
        ).exec()
        
        this.emitPlanUpdate(user, 'note.remove', state)
    }

    updNoteUpdate(user, state) {
        PlanModel.updateOne(
            { _id: this.id, 'notes._id': state.id }, 
            { $set: { 'notes.$.text': state.text } }
        ).exec()
        
        this.emitPlanUpdate(user, 'note.update', state)
    }

    updNoteMove(user, state) {
        PlanModel.updateOne(
            { _id: this.id, 'notes._id': state.id }, 
            { $set: { 'notes.$.position': state.position } }
        ).exec()

        this.emitPlanUpdate(user, 'note.move', state)
    }

    updDrawActions(user, state) {
        for (const action of state.actions) {
            // Apply action to the context
            const context = this.getContext(action.levelId)

            switch(action.type) {
                case 'draw': context.globalCompositeOperation = 'source-over'; break;
                case 'erase': context.globalCompositeOperation = 'destination-out'; break;
                default: break;
            }
            
            context.strokeStyle = action.color
            context.beginPath()
            context.moveTo(action.from.x, action.from.y)
            context.lineTo(action.to.x, action.to.y)
            context.closePath()
            context.stroke()

            this.drawActionBuffer.push({
                sender: user.id,
                state: action
            })
        }
    }

    updDrawClearLayer(user, state) {
        const layer = this.canvasLayers.find(l => l.levelId === state.id)

        if (!layer) {
            log.error(`Tried to clear drawings on unknown layer with id: ${state.id}`)
            return
        }

        layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height)

        PlanModel.updateOne(
            { _id: this.id, 'canvases._id': state.id }, 
            { $set: { 'canvases.$.uri': layer.canvas.toDataURL() } }
        ).exec()

        this.emitPlanUpdate(user, 'draw.clearlayer', state)
    }

    updAffixChange(user, state) {
        PlanModel.updateOne(
            { _id: this.id },
            { $set: { 'affixes': state.affixes } }
        ).exec()

        this.emitPlanUpdate(user, 'aff.change', state)
    }

    getContext(levelId) {
        let layer = this.canvasLayers.find(layer => layer.levelId === levelId)

        if (!layer) {
            const canvas = createCanvas(1000, 670)
            const context = canvas.getContext('2d')
            context.strokeStyle = "#ffffff";
            context.lineJoin = "round";
            context.lineWidth = 5;

            layer = {
                levelId,
                canvas,
                context
            }

            this.canvasLayers.push(layer)
        }

        return layer.context
    }
}

class PlanInstancePool {
    instances = []

    connectUser = socket => {
        socket.on('join-plan', planId => {
            let instance = this.instances.find(e => e.id === planId)
    
            if (!instance) {
                log.info('Creating new plan instance, id:', planId)
    
                instance = new PlanInstance(planId)
                instance.init()
                    .then(() => instance.addUser(socket))
                }
            else {
                if ((instance.hasUser(socket.id))) {
                    log.warn('Tried to add user that is already connected!')
                    return
                }

                instance.addUser(socket)
            }
                
            socket.on('disconnect', () => this.onUserDisconnect(socket.id, planId))
            this.instances.push(instance)
        })
    }

    closePlan = id => {
        log.info(`Closing plan instance ${id}`)

        const instance = this.instances.find(i => i.id === id)

        if (!instance) {
            log.error(`Failed to close plan instance ${id}. Not found`)
            return
        }

        instance.close()
        this.instances = this.instances.filter(i => i.id !== id)

        log.info(`Plan instance ${id} closed successfully`)
    }

    onUserDisconnect = (id, planId) => {
        const instance = this.instances.find(e => e.id === planId)

        if (!instance) {
            log.error('Disconnected user without instance, id:', id)
            return
        }

        if (!instance.removeUser(id)) {
            log.error(`Tried to remove user "${id}" that wasn't in the plan instance "${planId}"`)
        }
        else if (instance.count() === 0) {
            log.info(`Last user disconnected from instance "${planId}", closing it.`)

            instance.close()
            this.instances = this.instances.filter(e => e.id !== planId)
        }
    }
}

const pool = new PlanInstancePool()

export default {
    connectUser: pool.connectUser,
    closePlan: pool.closePlan
} 
