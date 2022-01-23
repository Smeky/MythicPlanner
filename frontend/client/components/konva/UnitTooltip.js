import React from 'react'
import Konva from 'react-konva'

class UnitTooltip extends React.Component {
    Width = 160
    Height = 56
    Margin = 5

    render() {
        // We can't use componentWillReceiveProps here as it is not supported inside Konva's context
        let x = this.props.x
        let y = this.props.y

        if (x + this.Width > this.props.right - this.Margin) {
            x = this.props.right - this.Margin - this.Width
        }
        if (y + this.Height > this.props.bottom - this.Margin) {
            y = this.props.bottom - this.Margin - this.Height
        }
        
        let text = ''
        text += `${this.props.name}\n`
        text += `${this.props.level} ${this.props.creatureType}\n`

        return (
            <Konva.Group x={x} y={y} >

                <Konva.Rect 
                    fill='#000000cc'
                    stroke='#5e5e5e'
                    strokeWidth={1}
                    width={this.Width}
                    height={this.Height} />

                <Konva.Text 
                    x={5}
                    y={5}
                    fontSize={12}
                    fill='#ffffff'
                    ellipsis
                    text={text}
                    width={this.Width} />

                <Konva.Text 
                    x={-5}
                    y={44}
                    fontSize={8}
                    fill='#ffffff'
                    align='right'
                    text={`${this.props.unitId}, ${this.props.packId}`}
                    width={this.Width} />
            </Konva.Group>
        )
    }
}

export default UnitTooltip
