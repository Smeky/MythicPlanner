import React from 'react'
import Konva from 'react-konva'
import { inject, observer } from 'mobx-react'

import { 
    ButtonGroup, 
    Button, 
    Divider, 
    ProgressBar, 
    Text, 
    Spinner, 
    ContextMenu, 
    Menu, 
    MenuItem,
    Callout
} from '@blueprintjs/core'

import { Unit, Door, Note, Layer, UnitTooltip } from 'components/konva'
import { ColorPicker, NoteEditor, AffixSelect } from 'components'

const DungeonsAssets = require.context('assets/dungeons')

@inject('plan') @observer
class Plan extends React.Component {
    StageWidth = 1000
    StageHeight = 666

    EditorBrush = 1
    EditorEraser = 2
    EditorAddNote = 3

    constructor(props) {
        super(props)

        this.lastPaintPost = {x: 0, y: 0}
        this.stageRef = React.createRef()
        this.layerRef = React.createRef()

        this.state = {
            maps: {},
            currentLevel: "",

            isStageLocked: false,
            isPainting: false,

            editState: '',

            noteEditId: null,

            highlightUnitId: null,
            highlightUnitPos: { x: 0, y: 0 },
            highlightPackId: null
        }
    }

    componentDidMount() {
        const { state } = this

        // When connecting to a plan via url, set the ID manually
        if (this.props.match.params.planId) {
            this.props.plan.planId = this.props.match.params.planId
            this.props.plan.planIdPending = false
        }

        this.props.plan.setupPlan(this.redrawStage)
            .then(success => {
                if (!success) {
                    return
                }

                const { dungeon } = this.props.plan

                const promises = dungeon.levels.map(level => {
                    return new Promise((res, rej) => {
                        const image = new Image()
                        image.src = DungeonsAssets(`./${dungeon.dungId}/${level.image}`)
                        image.onload = () => res([level.id, image])
                    })
                })

                Promise.all(promises)
                    .then(values => {
                        const maps = {}

                        values.forEach(v => { 
                            maps[v[0]] = v[1] 
                        })

                        this.setState({
                            maps,
                            currentLevel: values[0][0]
                        })
                    })
            })
    }

    componentWillUnmount() {
        this.props.plan.closePlan()    
    }

    redrawStage = () => {
        // Need to wrap this in another function as the ref is not filled at the mount time
        this.stageRef.current.getStage().draw()
    }

    handleMouseClick = e => {
        if (this.state.editState === this.EditorAddNote) {
            const pointerPos = this.layerRef.current.getPointerPosition()
            const id = this.props.plan.addNote(this.state.currentLevel, pointerPos)

            this.setState({
                editState: null,
                noteEditId: id
            })
        }
    }

    handleMouseDown = e => {
        // Todo: start drawing right away
        if ([this.EditorBrush, this.EditorEraser].includes(this.state.editState)) {
            this.lastPaintPost = this.layerRef.current.getPointerPosition()

            this.setState({
                isPainting: true,
                isStageLocked: true
            })
        }
    }

    handleMouseUp = e => {
        if ([this.EditorBrush, this.EditorEraser].includes(this.state.editState)) {
            this.setState({
                isPainting: false,
                isStageLocked: false
            })
        }
    }

    handleMouseMove = e => {
        if (this.state.isPainting) {
            const pos = this.layerRef.current.getPointerPosition()

            this.props.plan.drawLine(this.state.currentLevel, this.lastPaintPost, pos)

            this.lastPaintPost = pos
        }
    }

    handleDrawLayerDragMove = () => {
        this.setState({
            highlightUnitId: null,
            highlightPackId: null
        })
    }

    handleUnitClick = (event, packId, unitId) => {
        if (event.evt.shiftKey) {
            this.props.plan.selectUnit(this.state.currentLevel, unitId)
        }
        else {
            this.props.plan.selectPack(this.state.currentLevel, packId, unitId)
        }
    }

    handleUnitMouseEnter = (e, packId, unitId) => {
        this.setState({
            highlightUnitId: unitId,
            highlightUnitPos: { x: e.offsetX, y: e.offsetY },
            highlightPackId: packId
        })
    }

    handleUnitMouseLeave = (e, packId, unitId) => {
        this.setState({
            highlightUnitId: null,
            highlightPackId: null
        })
    }

    handleSublevelClick = level => {
        this.setState({ 
            currentLevel: level,
            highlightPackId: null,
            highlightUnitId: null
        })
    }

    handleMapContextMenu = e => {
        e.evt.preventDefault()

        const menu = React.createElement(
            Menu,
            {},
            React.createElement(MenuItem, { onClick: () => this.handleCanvasClear(), text: 'Clear all drawings' }),
        )

        ContextMenu.show(menu, { left: e.evt.clientX, top: e.evt.clientY })
    }
    handleCanvasClear = () => {
        this.props.plan.clearCanvas(this.state.currentLevel)
    }

    handleNoteEdit = noteId => this.setState({ noteEditId: noteId })
    handleNoteRemove = noteId => this.props.plan.removeNote(this.state.currentLevel, noteId)
    handleNoteDragStart = () => this.setState({ isStageLocked: true })
    handleNoteDragEnd = (noteId, position) => {
        this.setState({
            isStageLocked: false
        })

        this.props.plan.moveNote(this.state.currentLevel, noteId, position)
    }
    handleNoteContextMenu = (e, noteId) => {
        e.evt.preventDefault()

        const menu = React.createElement(
            Menu,
            {},
            React.createElement(MenuItem, { onClick: () => this.handleNoteEdit(noteId), text: 'Edit' }),
            React.createElement(MenuItem, { onClick: () => this.handleNoteRemove(noteId), text: 'Remove' })   
        )

        ContextMenu.show(menu, { left: e.evt.clientX, top: e.evt.clientY })
    }
    handleNoteDialogClose = () => this.setState({ noteEditId: null })
    handleNoteDialogConfirm = text => {
        this.props.plan.editNote(this.state.currentLevel, this.state.noteEditId, text)

        this.setState({
            noteEditId: null
        })
    }

    handleEditorToggleClick = (value) => {
        this.setState({
            editState: value === this.state.editState ? '' : value
        })

        if (value === this.EditorBrush || value === this.EditorEraser) {
            const type = value === this.EditorBrush ? 'source-over' : 'destination-out'

            this.props.plan.setDrawingType(type)
            this.props.plan.setDrawingEnabled(true)
        }
        else {
            this.props.plan.setDrawingEnabled(false)
        }
    }

    handleAffixesChange = affixes => this.props.plan.changeAffixes(parseInt(affixes))

    render() {
        const { plan } = this.props

        // If plan wasn't fully loaded yet
        if (!plan.isPlanInitialized || plan.isPlanLoading || this.state.currentLevel === '') {
            return (
                <div className='p-plan'>
                    <Spinner className='e-spinner' intent='primary' />
                </div>
            )
        }

        if (plan.isClosed) {
            return (
                <div className='p-plan'>
                    <Callout className='e-closed' intent='warning' title='Plan closed'>
                        <Text>Sorry, the plan instance has been closed.</Text>
                    </Callout>
                </div>
            )
        }

        return (
            <div className='p-plan'>
                { this.renderNoteDialog() }
                { this.renderEditBar() }

                <Konva.Stage
                    ref={this.stageRef}
                    width={this.StageWidth}
                    height={this.StageHeight}
                    // draggable={!this.state.isStageLocked}
                    onClick={this.handleMouseClick}
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    onMouseMove={this.handleMouseMove} >

                    <Layer 
                        ref={this.layerRef}
                        bounds={{ w: this.StageWidth, h: this.StageHeight }}
                        draggable={!this.state.isStageLocked} 
                        onDragMove={this.handleDrawLayerDragMove} >

                        <Konva.Image 
                            width={this.StageWidth}
                            height={this.StageHeight}
                            image={this.state.maps[this.state.currentLevel]} />

                        <Konva.Image 
                            image={this.props.plan.canvases[this.state.currentLevel].element}
                            onContextMenu={this.handleMapContextMenu} />
                        
                        {this.renderPatrols()}
                        {this.renderNotes()}
                        {this.renderDoors()}
                        {this.renderUnits()}
                    </Layer>

                    {/* No need to use our custom layer with extra functionality */}
                    <Konva.Layer listening={false}>
                        {this.renderUnitTooltip()}
                    </Konva.Layer>
                </Konva.Stage>
            </div>
        )
    }

    renderEditBar = () => {
        return (
            <div className='c-editbar'>
                <ButtonGroup minimal>
                    <Button 
                        icon='comment' 
                        active={this.state.editState === this.EditorAddNote}
                        onClick={() => this.handleEditorToggleClick(this.EditorAddNote)} />
                    
                    <Divider />
                    
                    <ColorPicker onChange={this.props.plan.setDrawingColor} />

                    <Button 
                        icon='edit' 
                        active={this.state.editState === this.EditorBrush}
                        onClick={() => this.handleEditorToggleClick(this.EditorBrush)} />

                    <Button 
                        icon='eraser' 
                        active={this.state.editState === this.EditorEraser}
                        onClick={() => this.handleEditorToggleClick(this.EditorEraser)} />
                </ButtonGroup>

                <Divider />

                { this.renderForcesBar() }

                <Divider />

                <AffixSelect 
                    week={this.props.plan.dungeon.affixes}
                    onChange={this.handleAffixesChange}
                />
            </div>
        )
    }

    renderForcesBar = () => {
        const { plan } = this.props
        const forces = plan.forces
        const maxForces = plan.getMaxForces()
        const value = plan.forces / maxForces
        const intent = value > 1.05 ? 'danger' : value > 1.025 ? 'warning' : value > 1.0 ? 'success' : 'none'

        return (
            <div className='c-forcesbar'>
                <Text>{forces} / {maxForces} ({Math.round(forces / maxForces * 1000) / 10}%)</Text>
                <ProgressBar 
                    animate={false}
                    stripes={false}
                    value={value}
                    intent={intent}
                />
            </div>
        )
    }

    renderNotes = () => {
        const level = this.props.plan.getLevel(this.state.currentLevel)

        return level.notes.map(note => 
            <Note 
                key={'note' + note.id}
                id={note.id}
                position={note.position}
                text={note.text}
                onDragStart={this.handleNoteDragStart}
                onContextMenu={this.handleNoteContextMenu}
                onDragEnd={this.handleNoteDragEnd} /> 
        )
    }
    
    renderNoteDialog = () => {
        const { noteEditId } = this.state
        let value = ''

        if (noteEditId) {
            value = this.props.plan.getNote(noteEditId).text
        }

        return (
            <NoteEditor 
                isOpen={noteEditId !== null}
                value={value}
                onClose={this.handleNoteDialogClose}
                onConfirm={this.handleNoteDialogConfirm} />
        )
    }

    renderUnits = () => {
        const units = this.props.plan.levelUnits[this.state.currentLevel]
        const teeming = this.props.plan.isTeeming()
        
        return units.map(unit => {
            // Todo: Filtering should be done by some Dungeon middleware
            if (!teeming && unit.teeming) {
                return null
            }
            // Todo: Aliance
            if (unit.faction !== null && unit.faction !== 1) {
                return null
            }

            return (
                <Unit
                    key={`u-${unit.unitId}`}
                    {...unit}

                    showValue={this.state.highlightPackId === unit.packId}

                    onClick={this.handleUnitClick}
                    onMouseEnter={this.handleUnitMouseEnter}
                    onMouseLeave={this.handleUnitMouseLeave}
                />
            )
        })
    }

    renderUnitTooltip = () => {
        if (this.state.highlightUnitId === null) {
            return null
        }

        const unit = this.props.plan.getUnit(this.state.highlightUnitId, this.state.currentLevel)
        const meta = this.props.plan.getUnitMeta(unit.unitId)

        return (
            <UnitTooltip 
                x={this.state.highlightUnitPos.x}
                y={this.state.highlightUnitPos.y}
                right={this.StageWidth}
                bottom={this.StageHeight}
                name={meta.name}
                level={meta.level}
                creatureType={meta.creatureType}
                unitId={unit.id}
                packId={this.state.highlightPackId}
            />
        )
    }

    renderDoors = () => {
        const level = this.props.plan.getLevel(this.state.currentLevel)
        
        if (level.doors === undefined || level.doors.length === 0) {
            return null
        }

        return level.doors.map(door => (
            <Door 
                key={door.id}
                x={door.x}
                y={door.y}
                direction={door.direction}
                onClick={() => this.handleSublevelClick(door.target)} />
        ))
    }

    renderPatrols = () => {
        if (!this.state.highlightPackId) {
            return null
        }

        const level = this.props.plan.getLevel(this.state.currentLevel)
        const pack = level.packs.find(p => p.id === this.state.highlightPackId)

        if (!pack.patrol) {
            return null
        }

        return (
            <Konva.Line 
                points={[].concat.apply([], pack.patrol.map(point => [point.x, point.y]))}
                stroke='#2067d8aa'
                strokeWidth={1.5}
                lineCap='round'
                lineJoin='round'
            />
        )
    }
}

export default Plan
