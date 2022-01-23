import React from 'react'
import Konva from 'react-konva'

class Door extends React.Component {
    constructor(props) {
        super(props)
        
        this.state = {
            image: null,
            clipY: 0,
            scale: 0.75
        }
    }

    updateClip(direction) {
        let multip = 0
        switch(direction) {
            case 'down':    multip = 0; break
            case 'left':    multip = 1; break
            case 'right':   multip = 2; break
            case 'up':      multip = 3; break
            case 'none':    multip = 4; break
            default: break
        }

        this.setState({
            clipY: multip * 27
        })
    }

    componentDidMount() {
        const image = new window.Image()
        image.src = require('assets/dungeons/_base/door.png')
        image.onload = () => {
            this.setState({
                image
            })
        }

        this.updateClip(this.props.direction)
    }

    componentWillReceiveProps(props) {
        this.updateClip(props.direction)
    }

    handleMouseEnter = () => {
        this.setState({
            scale: 1.3
        })
    }

    handleMouseLeave = () => {
        this.setState({
            scale: 1.0
        })
    }

    render() {
        return (

            <Konva.Circle 
                {...this.props}
                
                radius={14}
                scaleX={this.state.scale}
                scaleY={this.state.scale}
                fillPatternImage={this.state.image}
                fillPatternOffsetX={14}
                fillPatternOffsetY={14 + this.state.clipY}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                 />
            
        )
    }
}

export default Door
