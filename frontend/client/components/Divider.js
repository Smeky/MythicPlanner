import React from 'react'

const styles = {
    root: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)'
    },
    horizontal: {
        height: 1,
        width: '100%'
    },
    vertical: {
        height: 20, // constant height cuz of my inability to do css (height just doesn't expand for whatever reason -.-')
        width: 1,
        margin: '0px 7px'
    }
}

class Divider extends React.Component {
    render() {
        const { vertical } = this.props

        return (
            <div 
                style={{
                    ...styles.root,
                    ...(vertical ? styles.vertical : styles.horizontal)
                }}
            />
        )
    }
}

export default Divider
