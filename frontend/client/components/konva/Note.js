import React from 'react'
import Konva from 'react-konva'

class Note extends React.Component {
    constructor(props) {
        super(props)

        this.groupRef = React.createRef()
        this.textRef = React.createRef()
    }

    handleDragEnd = e => this.props.onDragEnd(this.props.id, this.groupRef.current.position())
    handleContextMenu = e => this.props.onContextMenu(e, this.props.id)

    render() {
        // Set the text directly to update the text's bounds before redraw,
        // so the background rect's dimensions are correct 
        if (this.textRef.current) {
            this.textRef.current.setText(this.props.text)
        }

        return (
            <Konva.Group
                ref={this.groupRef}
                scaleX={0.3}
                scaleY={0.3}
                position={this.props.position}
                onDragStart={this.props.onDragStart}
                onDragEnd={this.handleDragEnd}
                onDragMove={this.props.onDragMove}
                onContextMenu={this.handleContextMenu}
                draggable >

                <Konva.Rect
                    width={this.textRef.current ? this.textRef.current.getWidth() : 0}
                    height={this.textRef.current ? this.textRef.current.getHeight() : 0}
                    cornerRadius={5}
                    fill='rgba(20, 20, 20, 0.5)'
                    stroke='rgba(90, 90, 90, 0.3)'
                    strokeWidth={1}
                    shadowColor='rgba(10, 10, 10, 0.6)'
                    shadowBlur={3}
                    shadowOffset={{ x: 2, y: 2 }}
                />

                <Konva.Text 
                    ref={this.textRef}
                    fill='#d1c7a7'
                    padding={7}
                    width={140}
                />

            </Konva.Group>
        )
    }
}

export default Note
