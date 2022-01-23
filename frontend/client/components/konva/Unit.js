import React from 'react'
import Konva from 'react-konva'

const Scales = {
    0: 0.08,
    1: 0.09,
    2: 0.115,
    3: 0.135,
    4: 0.15,
    5: 0.16,
    6: 0.18,
    7: 0.19,
    8: 0.21,
    9: 0.21,
    10: 0.23,
    11: 0.23,
    12: 0.265,
    13: 0.265,
    14: 0.265,
    15: 0.265,
    16: 0.265,
    17: 0.265,
    18: 0.265,
    19: 0.265,
    20: 0.265,
    'boss': 0.3
}

class Unit extends React.Component {
    Radius = 25
    ScaleMin = 0.06
    ScaleMax = 0.3

    constructor(props) {
        super(props)

        this.ref = React.createRef()
        this.zIndexBuf = 0

        this.state = {
            highlight: false
        }
    }
    handleClick = event => {
        if (this.props.onClick) {
            this.props.onClick(event, this.props.packId, this.props.unitId)
        }
    }

    handleMouseEnter = () => {
        this.zIndexBuf = this.ref.current.getZIndex()
        this.ref.current.setZIndex(this.ref.current.getZIndex() + 100)

        this.setState({
            highlight: true
        })

        this.props.onMouseEnter(event, this.props.packId, this.props.unitId)
    }
    
    handleMouseLeave = () => {
        this.ref.current.setZIndex(this.zIndexBuf)

        this.setState({
            highlight: false
        })

        this.props.onMouseLeave(event, this.props.packId, this.props.unitId)
    }

    handleDragEnd = e => {
        this.props.onDragEnd(this.props.unitId, this.ref.current.position())
    }

    render() {
        const {
            sheet,
            x,
            y,
            value,
            selected,
            draggable,
            scale,
            scaleValue,
            isBoss,
            showValue
        } = this.props

        let scalar = this.state.highlight ? 1.35 : 1.0
        
        if (scale) {
            scalar *= scale
        }
        
        const scaleBase = Scales[this.props.isBoss ? 'boss' : scaleValue ? scaleValue : this.props.value]
        const scaleFinal = scaleBase * scalar

        return (
            <Konva.Group 
                ref={this.ref}
                x={x}
                y={y}
    
                onClick={this.handleClick}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}

                draggable={draggable || false}
                onDragStart={this.props.onDragStart}
                onDragEnd={this.handleDragEnd} >

                <Konva.Circle
                    radius={this.Radius}
                    scaleX={scaleFinal} 
                    scaleY={scaleFinal}
    
                    stroke='green'
                    strokeWidth={10}
                    strokeEnabled={selected}
                    
                    fillPatternImage={sheet.image}
                    fillPatternOffsetX={sheet.clip.w / 2 + sheet.clip.x}
                    fillPatternOffsetY={sheet.clip.h / 2 + sheet.clip.y}
                    fillPatternScaleX={this.Radius * 2 / sheet.clip.w}
                    fillPatternScaleY={this.Radius * 2 / sheet.clip.h} />

                { showValue && !isBoss &&
                    <Konva.Text 
                        fill='white'
                        offsetX={8}
                        offsetY={13}
                        scaleX={scaleFinal} 
                        scaleY={scaleFinal}
                        text={`${value}`}
                        fontSize={30} />
                }
            </Konva.Group>
        )
    }
}

export default Unit