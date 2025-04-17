import {html, Component} from '../lib.js'
import gsap from '../animations.js'
import Flip from 'gsap/Flip'

// Game logic
import createNewGame from '../../game/new-game.js'
import * as sounds from '../tones.js'
import {createCard} from '../../game/cards.js'
import {getCurrRoom, isCurrRoomCompleted, isDungeonCompleted} from '../../game/utils-state.js'

// UI Components
import Cards from './cards.js'
import enableDragDrop from '../dragdrop.js'
import Menu from './menu.js'
import {Overlay, OverlayWithButton} from './overlays.js'
import {Player, Monster} from './player.js'
import StartRoom from './start-room.js'
import startTutorial from '../intro-tutorial.js'

export default class App extends Component {
    get didWin() {
        return isCurrRoomCompleted(this.state)
    }
    get isDead() {
        return this.state.player.currentHealth < 1
    }
    get didWinEntireGame() {
        return isDungeonCompleted(this.state)
    }
    constructor() {
        super()
        this.base = undefined
        this.state = undefined
        this.game = {}
        this.overlayIndex = 11

        this.playCard = this.playCard.bind(this)
        this.handlePlayerReward = this.handlePlayerReward.bind(this)
        this.handleCampfireChoice = this.handleCampfireChoice.bind(this)
        this.handleChestReward = this.handleChestReward.bind(this)
        this.goToNextRoom = this.goToNextRoom.bind(this)
        this.toggleOverlay = this.toggleOverlay.bind(this)
        this.handleMapMove = this.handleMapMove.bind(this)
    }

    componentDidMount() {
        console.log("ComponentDidMount() lifecycle")
        const urlParams = new URLSearchParams(window.location.search)
        const debugMode = urlParams.has('debug')
        const demo = urlParams.has('demo')
        const game = createNewGame(debugMode, this.props.selectedCharacter)
        this.game = game;

        if(demo || 1) {
            const roomIndex = game.state.dungeon.graph[1].findIndex((r) => r.room)
            this.game.enqueue({type: 'move', move: {y: 1, x: roomIndex}})
            this.game.dequeue()
        }
        if(debugMode || 1) {
            this.enableConsole()
        }
        if (urlParams.has('tutorial')) {
            setTimeout(startTutorial, 800)
        }

        this.setState(game.state, this.dealCards)
        if(this.game.state.player) {
            console.log(`The state is set correctly and player evaluates to ${Object.prototype.toString.call(this.game.state.player)}`)
        } else {
            console.warn(`State is not set correctly as player evaluates to ${Object.prototype.toString.call(this.game.state.player)}`)
        }
    }

    restoreGame(oldState) {
        this.game.state = oldState
        this.setState(oldState, this.dealCards)
    }

    enableConsole() {
        window.dad = {
            game: this.game,
            run: this.runAction.bind(this),
            dealCards: this.dealCards.bind(this),
            createCard,
            nextRoom: this.goToNextRoom.bind(this),
            undo: this.undo.bind(this),
            help() {
                console.log('Welcome to the console for Dungeons and Decks. This will be used to allow certain actions to be run via commands in this console for debugging purposes')
                console.log('Some examples are dad.dealCards()')
            },
        }
        window.dad.help()
    }

    runAction(actionName, props) {
        const action = {type: actionName, ...props}
        this.game.enqueue(action)
        this.update()
    }

    update(callback) {
        this.game.dequeue()
        this.setState(this.game.state, callback)
    }

    undo() {
        this.game.undo()
        this.setState(this.game.state,this.dealCards)
    }

    playCard(cardId, target, cardEl) {
        try {
            const card = this.state.hand.find((c) => c.id === cardId)
            if (!card) {
                console.error('Card not found in hand:', cardId)
                return
            }
            
            this.game.enqueue({type: 'playCard', card, target})
            
            const supportsFlip = typeof Flip !== 'undefined'
            let flip
            
            if (supportsFlip && this.base) {
                flip = Flip.getState(this.base.querySelectorAll('.Hand .Card'))
            }
            
            const clone = cardEl.cloneNode(true)
            if (!clone || !this.base) {
                throw new Error('Unable to clone card or base element not available')
            }
            
            const cardRect = cardEl.getBoundingClientRect()
            clone.style.position = 'absolute'
            clone.style.width = cardEl.offsetWidth + 'px'
            clone.style.height = cardEl.offsetHeight + 'px'
            clone.style.top = window.scrollY + cardRect.top + 'px'
            clone.style.left = window.scrollX + cardRect.left + 'px'
            clone.style.transform = ''
            
            this.base.appendChild(clone)
            
            this.update(() => {
                if (typeof enableDragDrop === 'function' && this.base) {
                    enableDragDrop(this.base, this.playCard)
                }
                
                if (sounds && sounds.playCard) {
                    sounds.playCard({card})
                }
                
                if (gsap && gsap.effects && gsap.effects.playCard) {
                    gsap.effects.playCard(clone).then(() => {
                        if (clone && clone.parentNode) {
                            clone.parentNode.removeChild(clone)
                        }
                    })
                } else {
                    setTimeout(() => {
                        if (clone && clone.parentNode) {
                            clone.parentNode.removeChild(clone)
                        }
                    }, 500)
                }
                
                if (supportsFlip && flip) {
                    Flip.from(flip, {
                        duration: 0.3,
                        ease: 'power3.inOut',
                        absolute: true,
                    })
                }
            })
        } catch (error) {
            console.error('Error in playCard:', error)
            this.update()
        }
    }

    endTurn() {
        const room = getCurrRoom(this.state)
        if(!this.didWinEntireGame && this.didWin && room.type === 'monster') return
        
        if (sounds && sounds.endTurn) {
            sounds.endTurn()
        }
        
        if (gsap && gsap.effects && gsap.effects.discardHand) {
            gsap.effects.discardHand('.Hand .Card', {
                onComplete: reallyEndTurn.bind(this),
            })
        } else {
            reallyEndTurn.call(this)
        }
        
        function reallyEndTurn() {
            this.game.enqueue({type: 'endTurn'})
            this.update(this.dealCards)
        }
    }

    dealCards() {
        if (!this.base) {
            console.warn('Base element not available in dealCards')
            return
        }
        
        const cards = this.base.querySelectorAll('.Hand .Card')
        if (!cards?.length) {
            console.log('No cards found to deal')
            return
        }
        
        if (gsap && gsap.effects && gsap.effects.dealCards) {
            gsap.effects.dealCards('.Hand .Card')
        }
        
        if (sounds && sounds.startTurn) {
            sounds.startTurn()
        }
        
        if (typeof enableDragDrop === 'function') {
            enableDragDrop(this.base, this.playCard)
        }
    }

    handlePlayerReward(choice, card) {
        this.game.enqueue({type:'addCardToDeck', card})
        this.setState({didPickCard: card})
        this.update()
        this.goToNextRoom()
    }

    handleCampfireChoice(choice, reward) {
        if(choice === 'rest') {
            reward = Math.floor(this.game.state.player.maxHealth * 0.3)
            this.game.enqueue({type: 'addHealth', target: 'player', amount: reward})
        } else if(choice === 'upgradeCard') {
            this.game.enqueue({type: 'upgradeCard', card: reward})
        } else if(choice === 'removeCard') {
            this.game.enqueue({type: 'removeCard', card: reward})
        }
        
        this.game.enqueue({type: 'makeCampfireChoice', choice, reward})
        
        this.update(() => this.update())
        this.goToNextRoom()
    }

    handleChestReward(relic) {
        this.game.enqueue({type: 'addRelic', relic})
        this.setState({didPickRelic: relic})
        this.update()
        this.goToNextRoom()
    }

    goToNextRoom() {
        console.log('Function run: goToNextRoom\nEffect: toggles the map overlay')
        this.toggleOverlay('#Map')
    }

    toggleOverlay(el) {
        if (typeof el === 'string') {
            console.log('Recieved a string\n')
            el = this.base.querySelector(el)
        }
        if (!el) {
            console.warn('Overlay element not found\nType found: ')
            console.warn(Object.prototype.toString.call(el))
            return
        }
        el.toggleAttribute('open')
        el.style.zIndex = `${this.overlayIndex}`
        this.overlayIndex++
    }

    handleShortcuts(event) {
        if (event.target.nodeName === 'INPUT') return
        const { key } = event
        const keymap = {
            e: () => this.endTurn(),
            u: () => this.undo(),
            Escape: () => {
                let openOverlays = this.base.querySelectorAll(
                    '#Deck[open], #Map[open], #DrawPile[open], #DiscardPile[open], #ExhaustPile[open]',
                )
                const mapOpened = document.querySelector('#Map').hasAttribute('open')
                openOverlays.forEach((el) => el.removeAttribute('open'))
                if (!mapOpened) this.toggleOverlay('#Menu')
            },
            d: () => this.toggleOverlay('#Deck'),
            m: () => this.toggleOverlay('#Map'),
            a: () => this.toggleOverlay('#DrawPile'),
            s: () => this.toggleOverlay('#DiscardPile'),
            x: () => this.toggleOverlay('#ExhaustPile')
        }
        keymap?.[key]?.()
    }

    handleMapMove(move) {
        this.toggleOverlay('#Map')
        this.setState({didPickCard: false})
        this.game.enqueue({type: 'move', move})
        this.update(this.dealCards)
    }

    render(props, state) {
        console.log("render() lifecycle")
        if(!state?.player) {
            return html`<div class="App loading">Loading game...</div>`
        }
        
        const room = getCurrRoom(state) || { type: 'unknown' }
        const showCombat = room.type === 'monster'

        return html`
        <div class="App" tabindex="0" onkeydown=${(e) => this.handleShortcuts(e)}>
            <figure class="App-background" data-room-index=${state.dungeon.y}></div>

            ${
                this.isDead && 
                html`<${Overlay}>
                    <div class="Container">
                        <h1 center>You have died!</h1>
                        <button onClick=${() => this.props.onLoose()}>Try again?</button>
                        </div>
                        <//> `
            }
            
            ${
                state.won &&
                html`<${Overlay}>
                    <div class="Container CContainer--center">
                        <h1 center>You Won!</h1>
                        <p><button onClick=${() => this.props.onWin()}>Continue?</button></p>
                        </div>
                        <//>`
            }
            
            ${room.type === 'start' && html`<${Overlay}><${StartRoom} onContinue=${this.goToNextRoom} /> <//>`}

            ${
                room.type === 'campfire' &&
                html`<${Overlay} middle>
                    <${CampfireRoom}
                        gameState=${state}
                        onChoose=${this.handleCampfireChoice}
                        onContinue=${this.goToNextRoom}
                    ><//>
                <//>`
            }
            
            ${
                showCombat &&
                html`
                    <div class="Targets Split">
                        <div class="Targets-group">
                            <${Player} model=${state.player} name="Player" />
                        </div>
                        <div class="Targets-group">
                            ${room.monsters &&
                            room.monsters.map((monster) => html`<${Monster} model=${monster} gameState=${state} />`)}
                        </div>
                    </div>

                    <div class="Split ${!state.player.currentEnergy ? 'no-energy' : ''}">
                        <div class="EnergyBadge">
                            <span
                                class="tooltipped tooltipped-e tooltipped-multiline"
                                aria-label="Cards costs energy and this badge shows how much you have left this turn. Next turn your energy is refilled."
                                >${state.player.currentEnergy}/${state.player.maxEnergy}</span
                            >
                        </div>
                        <p class="Actions">
                            <button class="EndTurn" onClick=${() => this.endTurn()}><u>E</u>nd turn</button>
                        </p>
                    </div>

                    <div class="Hand">
                        <${Cards} gameState=${state} type="hand" />
                    </div>
                `
            }

            <${OverlayWithButton} id="Menu" topleft>
            <button onClick=${() => this.toggleOverlay('#Menu')}><u>Esc</u>ape</button>
                <div class="Overlay-content">
                    <${Menu} gameState=${state} game=${this.game} onUndo=${() => this.undo()} />
                </div>
            <//>

            <${OverlayWithButton} id="Map" topright key=${1}>
                <button align-right onClick=${() => this.toggleOverlay('#Map')}><u>M</u>ap</button>
                <div class="Overlay-content">
                    <p>Map import hasn't been added yet</p>
                </div>
            <//>
            

            <${OverlayWithButton} id='Deck' topright topright2>
                <button class="tooltipped tooltipped-se" aria-label="All the cards you own" onClick=${() =>
                    this.toggleOverlay('#Deck')}><u>D</u>eck ${state.deck.length}</button>
                    <div class='Overlay-content'>
                        <${Cards} gameState=${state} type="deck" />
                    </div>
            <//>
            

            <${OverlayWithButton} id='DrawPile' bottomleft>
                <button class="tooltipped tooltipped-ne" aria-label="The cards you will draw next in a random order" onClick=${() =>
                    this.toggleOverlay('#DrawPile')}>Dr<u>a</u>w pile ${state.drawPile.length}</button>
                <div class="Overlay-content">
                    <${Cards} gameState=${state} type="drawPile" />
                </div>
            <//>
            

            <${OverlayWithButton} id="ExhaustPile" topleft topleft2>
                    <button class="tooltipped tooltipped-se" aria-label="The cards you have exhausted this combat" onClick=${() =>
                    this.toggleOverlay('#ExhaustPile')}>E<u>x</u>haust pile ${state.exhaustPile.length}</button>
                    <div class="Overlay-content">
                        <${Cards} gameState=${state} type="exhaustPile" />
                    </div>
            <//>
            

            <${OverlayWithButton} id="DiscardPile" bottomright>
                <button onClick=${() =>
                this.toggleOverlay('#DiscardPile')} align-right class="tooltipped tooltipped-nw tooltipped-multiline"
                aria-label="Cards you have already played. The discard pile is shuffled into the draw pile when the draw pile contains less cards than the amount attempting to be drawn.">Di<u>s</u>card pile 
                ${state.discardPile.length}</button>
                <div class="Overlay-content">
                    <${Cards} gameState=${state} type="discardPile"/>
                </div>
            <//>
        </div>
        `
    }
}
