import React from 'react'
import Konva from 'react-konva'

class Layer extends React.Component {
    ref = React.createRef()
    state = {
        scale: 1.0,
        position: { x: 1.0, y: 1.0 }
    }

    clampPosition = (pos, scale) => {
        let newPos = { ...pos }
        
        if (newPos.x > 0.0) {
            newPos.x = 0.0
        }
        else if (this.props.bounds.w * scale + newPos.x < this.props.bounds.w) {
            newPos.x = -this.props.bounds.w * (scale - 1)
        }
        
        if (newPos.y > 0.0) {
            newPos.y = 0.0
        }
        else if (this.props.bounds.h * scale + newPos.y < this.props.bounds.h) {
            newPos.y = -this.props.bounds.h * (scale - 1)
        }
        
        return newPos
    }

    handleDragMove = e => {
        if (this.props.draggable) {
            this.setState({
                position: this.clampPosition({
                    x: this.state.position.x + e.evt.movementX,
                    y: this.state.position.y + e.evt.movementY
                }, this.state.scale)
            })
        }

        if (this.props.onDragMove) {
            this.props.onDragMove(e)
        }
    }

    handleWheelEvent = e => {
        const { position, scale } = this.state;

        let oldScale = scale
        let newScale = scale - e.evt.deltaY / 700
        let pointerPos = this.ref.current.getStage().getPointerPosition()

        if (newScale < 1.0) {
            newScale = 1.0
        }

        let mousePointTo = {
            x: pointerPos.x / oldScale - position.x / oldScale,
            y: pointerPos.y / oldScale - position.y / oldScale
        }
        let newPos = this.clampPosition({
            x: -(mousePointTo.x - pointerPos.x / newScale) * newScale,
            y: -(mousePointTo.y - pointerPos.y / newScale) * newScale
        }, newScale)

        this.setState({
            scale: newScale,
            position: newPos
        })
    }

    getPointerPosition = () => {
        const { scale, position } = this.state
        const pointerPos = this.ref.current.getStage().getPointerPosition()

        return {
            x: pointerPos.x / scale - position.x / scale,
            y: pointerPos.y / scale - position.y / scale
        }
    }

    render() {
        return (
            <Konva.Layer
                {...this.props}
                ref={this.ref}
                position={this.state.position}
                scaleX={this.state.scale}
                scaleY={this.state.scale}
                onDragMove={this.handleDragMove}
                onWheel={this.handleWheelEvent} >

                {this.props.children}
            </Konva.Layer>
        )
    }
}

export default Layer
