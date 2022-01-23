import { observable, computed, action, flow, runInAction } from 'mobx'

import * as sockets from 'utils/sockets'

const DungeonsAssets = require.context('assets/dungeons')

class StoreApp {
    MapWidth = 1000
    MapHeight = 670

    @observable collection = null

    @observable planId = null
    @observable planIdPending = false
    
    @observable isClosed = false
    @observable isPlanInitialized = false
    @observable isPlanLoading = false
    socket = null

    canvases = {}
    redrawStage = null
    drawActionBuffer = []
    drawActionInterval = null

    @observable dungeon = {}

    @observable levelUnits = {}
    spriteSheetMeta = null
    spriteSheetImage = null

    constructor(app) {
        this.app = app
    }

    /* Flows */

    createPlan = flow(function* (dungId) {
        this.planIdPending = true
        
        const res = yield this.app.requests.post('/plan/create', { dungId })

        if (!res) {
            return false
        }

        this.planId = res.planId
        this.isPlanInitialized = false
        this.planIdPending = false
        
        return true
    })

    setupPlan = flow(function* (redrawStage) {
        if (!this.planId) {
            throw new Error('Invalid planId')
            return false
        }

        this.isClosed = false
        this.isPlanLoading = true

        const res = yield this.app.requests.get('/plan/exists', { planId: this.planId })
        if (!res) {
            return false
        }
        else if (!res.exists) {
            return false
        }

        const socket = yield sockets.connect()
        this.socket = socket

        const dungeon = yield this.joinPlan(this.socket)
        this.dungeon = dungeon

        this.redrawStage = redrawStage

        this.socket.on('reconnect', () => this.joinPlan(this.socket))
        this.socket.on('plan-update', this.onPlanUpdate)

        this.isPlanInitialized = true
        this.isPlanLoading = false

        return true
    })

    fetchCollection = flow(function* () {
        const coll = yield this.app.requests.get('/plan/collection')

        if (coll) {
            this.collection = coll.sort((a, b) => {
                return new Date(b.created) - new Date(a.created)
            })
        }
    })

    /* Computed */

    @computed get forces() {
        let value = 0

        for (const units of Object.values(this.levelUnits)) {
            value = units.reduce((total, unit) => {
                if (unit.isBoss || unit.value === undefined) {
                    return total
                }
                
                return unit.selected ? total + unit.value : total
            }, value)
        }

        return value
    }

    /* Actions */

    @action.bound
    closePlan() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }

        this.isPlanInitialized = false
        this.isPlanLoading = false

        this.drawActionBuffer = []
        clearInterval(this.drawActionInterval)
    }

    @action.bound
    deletePlan(id) {
        this.app.requests.delete('/plan/delete', { id })
        this.collection.remove(this.collection.find(p => p._id === id))
    }

    @action.bound
    selectUnit(levelId, unitId) {
        const units = this.levelUnits[levelId]
        const unit = units.find(u => u.unitId === unitId)

        unit.selected = !unit.selected

        this.sendPlanUpdate('unit.select', { units: [{ id: unit.untiId, selected: unit.selected }] })
    }

    @action.bound
    selectPack(levelId, packId, unitId) {
        const units = this.levelUnits[levelId]
        const unit = units.find(u => u.unitId === unitId)

        const selected = !unit.selected
        const updated = []
        
        units
            .filter(u => u.packId === packId)
            .forEach(u => {
                u.selected = selected

                updated.push({ id: u.unitId, selected: u.selected })
            })

        this.sendPlanUpdate('unit.select', { units: updated })
    }

    @action.bound
    addNote(levelId, position) {
        // Todo: Better ID generation
        let noteId = 0
        this.dungeon.levels.forEach(level => {
            level.notes.forEach(note => {
                if (note.id > noteId) {


                    noteId = note.id
                }
            })
        })
        noteId += 1

        const level = this.getLevel(levelId)
        const note = { id: noteId, position, text: '' }
        
        level.notes.push(note)

        this.sendPlanUpdate('note.add', { id: note.id, text: note.txt, position: note.position, levelId })

        return noteId
    }

    @action.bound
    removeNote(levelId, noteId) {
        const level = this.getLevel(levelId)

        level.notes.remove(level.notes.find(n => n.id === noteId))

        this.sendPlanUpdate('note.remove', { id: noteId })
    }

    @action.bound
    editNote(levelId, noteId, text) {
        const level = this.getLevel(levelId)
        const note = level.notes.find(n => n.id === noteId)

        note.text = text

        this.sendPlanUpdate('note.update', { id: note.id, text: note.text })
    }

    @action.bound
    moveNote(levelId, noteId, position) {
        const level = this.getLevel(levelId)
        const note = level.notes.find(n => n.id === noteId)

        note.position = position

        this.sendPlanUpdate('note.move', { id: note.id, position: note.position })
    }

    @action.bound
    drawLine(levelId, from, to) {
        const context = this.canvases[levelId].context

        context.beginPath()
        context.moveTo(from.x, from.y)
        context.lineTo(to.x, to.y)
        context.closePath()
        context.stroke()

        this.redrawStage()

        this.drawActionBuffer.push({
            levelId, 
            type: context.globalCompositeOperation === 'source-over' ? 'draw' : 'erase',
            shape: 'line',
            color: context.strokeStyle,
            from, 
            to
        })
    }

    @action.bound
    setDrawingEnabled(enabled) {
        // We setup the interval only when drawing is actually enabled, as
        // that will be only a fraction of the overall plan usage
        if (enabled) {
            this.drawActionInterval = setInterval(() => {
                if (this.drawActionBuffer.length > 0) {
                    this.sendPlanUpdate('draw.actions', { actions: this.drawActionBuffer })
                    this.drawActionBuffer = []
                }
            }, 50)
        }
        else {
            // Send the leftover actions
            if (this.drawActionBuffer.length > 0) {
                this.sendPlanUpdate('draw.actions', { actions: this.drawActionBuffer })
                this.drawActionBuffer = []
            }

            clearInterval(this.drawActionInterval)
        }
    }

    @action.bound
    setDrawingType(type) {
        for (const canvas of Object.values(this.canvases)) {
            canvas.context.globalCompositeOperation = type
        }
    }

    @action.bound
    setDrawingColor(color) {
        for (const canvas of Object.values(this.canvases)) {
            canvas.context.strokeStyle = color
        }
    }

    @action.bound
    changeAffixes(affixes) {
        this.dungeon.affixes = affixes

        this.sendPlanUpdate('aff.change', { affixes })
    }

    @action.bound
    clearCanvas(levelId) {
        this.canvases[levelId].context.clearRect(0, 0, this.MapWidth, this.MapHeight)
        this.redrawStage()

        this.sendPlanUpdate('draw.clearlayer', { id: levelId })
    }
    
    /* Member methods */

    isTeeming = () => {
        return [2, 6, 9].includes(this.dungeon.affixes)
    }

    getMaxForces = () => {
        return this.isTeeming(this.dungeon.affixes) ? this.dungeon.forces.teeming : this.dungeon.forces.normal
    }

    getLevel = id => {
        return this.dungeon.levels.find(l => l.id === id)
    }

    getLevelByNoteId = noteId => {
        for (const level of this.dungeon.levels) {
            for (const note of level.notes) {
                if (note.id === noteId) {
                    return level
                }
            }
        }
    
        return null
    }

    getUnit = (unitId, levelId) => {
        const level = this.getLevel(levelId)

        for (const pack of level.packs) {
            for (const unit of pack.units) {
                if (unit.id === unitId) {
                    return unit
                }
            }
        }
    }

    getUnitMeta = (unitId) => {
        return this.dungeon.units[unitId]
    }

    getNote = (noteId, levelId = null) => {
        if (levelId) {
            const level = this.getLevel(levelId)
            return level.notes.find(note => note.id === noteId)
        }
        else {
            for (const level of this.dungeon.levels) {
                for (const note of level.notes) {
                    if (note.id === noteId) {
                        return note
                    }
                }
            }
        }
    }

    async joinPlan(socket) {
        return new Promise((res, rej) => {
            socket.once('plan-joined', remote => {
                runInAction(() => {
                    const dungeon = DungeonsAssets(`./${remote.dungId}/data.json`)

                    this.canvases = {} // Todo: leaves data in garbage collection, perhaps some onExit clear + deletion of such objects?
                    this.levelUnits = {}
                    this.spriteSheetMeta = DungeonsAssets(`./${remote.dungId}/${dungeon.spritesheet.meta}`)
                    this.spriteSheetImage = new Image()
                    this.spriteSheetImage.src = DungeonsAssets(`./${remote.dungId}/${dungeon.spritesheet.image}`)
    
                    dungeon.dungId = remote.dungId
                    dungeon.affixes = remote.affixes
                    dungeon.levels.forEach(level => {
                        level.sublevels = level.sublevels || []
                        level.scale = level.scale || 1
    
                        const element = document.createElement('canvas')
                        element.width = this.MapWidth
                        element.height = this.MapHeight
                
                        const context = element.getContext('2d')
                        context.strokeStyle = "#ffffff";
                        context.lineJoin = "round";
                        context.lineWidth = 5;
                        
                        const canvasLayer = remote.canvases.find(layer => layer.levelId === level.id)
                        if (canvasLayer) {
                            const image = new window.Image()
                            image.src = canvasLayer.uri
                            image.onload = () => {
                                context.drawImage(image, 0, 0)       
                            }
                        }
    
                        this.canvases[level.id] = {
                            element,
                            context
                        }
    
                        const units = []
                        for (const pack of level.packs) {
                            for (const unit of pack.units) {
                                const remoteUnit = remote.units.find(u => u.id === unit.id)
    
                                units.push({
                                    sheet: {
                                        image: this.spriteSheetImage,
                                        clip: this.spriteSheetMeta.frames[dungeon.units[unit.unitId].image].frame
                                    },
                                    x: unit.x,
                                    y: unit.y,
                                    teeming: unit.teeming || false,
                                    faction: unit.faction || null,
                                    value: unit.value || dungeon.units[unit.unitId].value, // unit.value is for overrides from specific units
                                    scaleValue: dungeon.units[unit.unitId].scaleValue || null,
                                    scale: level.scale || 1.0,
                                    unitId: unit.id,
                                    packId: pack.id,
                                    isBoss: dungeon.units[unit.unitId].isBoss,
                                    selected: remoteUnit ? remoteUnit.selected : false
                                })
                            }
                        }
                        this.levelUnits[level.id] = units
                        
                        level.notes = remote.notes.filter(note => note.levelId === level.id).map(note => {
                            return {
                                id: note.id,
                                position: note.position,
                                text: note.text
                            }
                        })
                    })
    
                    res(dungeon)
                })
            })

            socket.emit('join-plan', this.planId)
        })
    }

    onPlanUpdate = data => {
        const { name, state } = data

        if (name === 'draw.actions') {
            state.actions.forEach(action => {
                const context = this.canvases[action.levelId].context

                const colorBuffer = context.strokeStyle
                const operBuffer = context.globalCompositeOperation
                
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

                context.strokeStyle = colorBuffer
                context.globalCompositeOperation = operBuffer
            })

            this.redrawStage()
        }
        else if (name === 'unit.select') {
            for (const units of Object.values(this.levelUnits)) {
                for (const unit of units) {
                    const remote = state.units.find(u => u.id === unit.unitId)

                    if (remote) {
                        unit.selected = remote.selected
                    }
                }
            }
        }
        else if (name === 'note.add') {
            const level = this.getLevel(state.levelId)
            
            level.notes.push({ id: state.id, text: state.text, position: state.position })
        }
        else if (name === 'note.remove') {

            const level = this.getLevelByNoteId(state.id)
            const note = level.notes.find(n => n.id === state.id)

            level.notes.remove(note)
        }
        else if (name === 'note.update') {
            const level = this.getLevelByNoteId(state.id)
            const note = level.notes.find(n => n.id === state.id)

            note.text = state.text
        }
        else if (name === 'note.move') {
            const level = this.getLevelByNoteId(state.id)
            const note = level.notes.find(n => n.id === state.id)

            note.position = state.position
        }
        else if (name === 'aff.change') {
            this.dungeon.affixes = state.affixes
        }
        else if (name === 'draw.clearlayer') {
            this.canvases[state.id].context.clearRect(0, 0, this.MapWidth, this.MapHeight)
            this.redrawStage()
        }
        else if (name === 'plan.closed') {
            this.isClosed = true
            this.socket.disconnect()
        }
    }

    sendPlanUpdate = (name, state) => {
        this.socket.emit('plan-update', { name, state })
    }
}

export default StoreApp