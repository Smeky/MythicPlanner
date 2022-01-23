import React from 'react'

import { Text, Button, MenuItem } from '@blueprintjs/core'
import { Select, ItemRenderer } from '@blueprintjs/select'

import { AffixMeta, AffixWeeks } from 'constants/affixes'
const AffixImages = require.context('assets/web/affixes')

class AffixMenuItem extends React.Component {
    render() {
        return (
            <button 
                className={`bp3-menu-item c-affitem ${this.props.active ? 'bp3-active' : ''}`}
                onClick={this.props.onClick} >

                <Text>{this.props.week}.</Text>
                <div>
                    { AffixWeeks[this.props.week].map(affix => (
                        <img 
                            key={`aff-${this.props.week}-${affix}`}
                            className='e-affimage'
                            title={AffixMeta[affix][0]} 
                            src={AffixImages('./' + AffixMeta[affix][1])} />
                    )) }
                </div>
            </button>
        )
    }
}

const filterWeek = (query, week) => {
    return AffixWeeks[week].find(affix => AffixMeta[affix][0].toLowerCase().includes(query)) !== undefined
}

const renderWeek = (week, { handleClick, modifiers }) => {
    if (!modifiers.matchesPredicate) {
        return null
    }

    return (
        <li key={`aff-${week}`}>
            <AffixMenuItem 
                week={week}
                active={modifiers.active}
                onClick={handleClick} />
        </li>
    )
}

const AffixSelection = Select.ofType()

class AffixSelect extends React.Component {
    render() {
        return (
            <AffixSelection
                className='Testy test'
                items={Object.keys(AffixWeeks)}
                itemPredicate={filterWeek}
                itemRenderer={renderWeek}
                noResults={<Text>No results.</Text>}
                onItemSelect={this.props.onChange}
                inputProps={{ className: 'c-affixquery' }} >

                <AffixMenuItem week={this.props.week} />
            </AffixSelection>
        )
    }
}

export default AffixSelect
