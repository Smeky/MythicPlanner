import React from 'react'
import { reaction } from 'mobx'
import { inject, observer } from 'mobx-react'

import { 
    Callout, 
    Card, 
    Button, 
    H3, 
    ControlGroup, 
    Text, 
    Popover, 
    Menu, 
    MenuItem, 
    Position, 
    Alert,
    HTMLSelect 
} from '@blueprintjs/core'

import { Login } from 'components'

import { AffixMeta, AffixWeeks } from 'constants/affixes'
const AffixImages = require.context('assets/web/affixes')

@inject('app', 'plan') @observer
export class Home extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            dungeon: 'ataldazar',
            error: false,
            login: false,
            remove: null
        }
    }

    componentDidMount(props) {
        if (this.props.app.loggedIn) {
            this.props.plan.fetchCollection()
            
            if (!this.props.app.dungeonList) {
                this.props.app.fetchDungeonList()
            }
        }
        else {
            reaction(
                () => this.props.app.loggedIn, 
                (loggedIn, reaction) => {
                    if (loggedIn) {
                        this.props.plan.fetchCollection()
                        
                        if (!this.props.app.dungeonList) {
                            this.props.app.fetchDungeonList()
                        }

                        reaction.dispose()
                    }
                }    
            )
        }
    }

    handleLoginClick = () => {
        this.setState({
            login: true
        })
    }

    handleLoginClose = () => {
        this.setState({
            login: false
        })
    }

    handleDungSelect = event => {
        this.setState({
            dungeon: event.target.value,
            error: false
        })
    }
    
    handleCreatePlan = () => {
        this.props.plan.createPlan(this.state.dungeon)
            .then(res => {
                if (res) {
                    this.props.history.push('/plan/' + this.props.plan.planId)
                }
            })
    }

    handleCollectionClick = id => () => {
        this.props.history.push('/plan/' + id)
    }

    handlePlanRemoveOpen = id => () => this.setState({ remove: id })
    handlePlanRemoveClose = () => this.setState({ remove: null })
    handlePlanRemove = () => {
        this.props.plan.deletePlan(this.state.remove)

        this.setState({
            remove: null
        })
    }

    render() {
        return (
            <>
                <Login 
                    isOpen={this.state.login}
                    onClose={this.handleLoginClose} />

                <div className='p-home'>
                    <div className='c-title'>
                        <img className='i-title' src={require('assets/web/title.png')} />
                        <img className='i-title-line' src={require('assets/web/title-line.png')} />
                    </div>

                    {/* Don't render content if we are not sure whether we are logged in or not, */}
                    {/* to prevent content flickering after the check is done */}
                    <div className='c-content' hidden={this.props.app.isCheckingLogin}>
                        { this.props.app.loggedIn ? (
                            this.renderContent()
                        ) : (
                            this.renderLogin()
                        )}
                    </div>
                </div>
            </>
        )
    }

    renderLogin() {
        return (
            <Callout intent='primary' icon={null} title='Mythic planner'>
                Serves as a tool to plan out your Mythic+ strategy. It offers live sharing, storage of your plans and much more.
                <br />
                <br />
                <i>The alpha version has limited access. If you are interested, please contact me at smeky.sobota@gmail.com</i>
                <br />
                <br />
                { <Button intent='primary' text='Login' onClick={this.handleLoginClick} /> } to continue.
            </Callout>
        )
    }

    renderContent() {
        return (
            <>
                <Callout icon={null} className='c-createplan'>
                    <H3>Create a plan</H3>
                    <ControlGroup>
                        <HTMLSelect 
                            fill
                            disabled={this.props.app.dungeonListLoading}
                            options={this.props.app.dungeonList || []}
                            onChange={this.handleDungSelect} />
                        <Button 
                            intent='primary'
                            text='Create'
                            onClick={this.handleCreatePlan} />
                    </ControlGroup>
                </Callout>

                { this.renderPlanCollection() }
                { this.renderPlanRemoveDialog() }
            </>
        )
    }

    renderPlanCollection() {
        const { collection } = this.props.plan

        if (!collection || collection.length === 0) {
            return null
        }

        return (
            <Callout className='c-plancollection' icon={null} title='Your plans'>
                { collection.map(plan => (
                    <ControlGroup key={`pc-${plan._id}`}>
                        <Button 
                            className='e-planbutton'
                            minimal
                            fill
                            onClick={this.handleCollectionClick(plan._id)} >

                            <Text>{plan.name}</Text>
                            <div className='c-planaffixes'>
                                { AffixWeeks[plan.affixes].map(affix => (
                                    <img 
                                        key={`aff-${plan.affixes}-${affix}`}
                                        className='e-affimage'
                                        title={AffixMeta[affix][0]} 
                                        src={AffixImages('./' + AffixMeta[affix][1])} /> 
                                ))}
                            </div>
                        </Button>
                            <Popover 
                                position={Position.RIGHT}
                                content={
                                    <Menu>
                                        <MenuItem icon='trash' text='Remove' onClick={this.handlePlanRemoveOpen(plan._id)} />
                                    </Menu>
                                }>

                                <Button minimal icon='menu'/>
                            </Popover>
                    </ControlGroup>
                )) }
            </Callout>
        )
    }
    
    renderPlanRemoveDialog() {
        return (
            <Alert 
                isOpen={this.state.remove !== null} 
                icon='trash'
                intent='danger'
                cancelButtonText='Cancel'
                confirmButtonText='Delete'
                onCancel={this.handlePlanRemoveClose}
                onConfirm={this.handlePlanRemove} >

                <p>Are you sure you want to delete this plan? This action can not be reverted.</p>
            </Alert>
        )
    }
}

export default Home
