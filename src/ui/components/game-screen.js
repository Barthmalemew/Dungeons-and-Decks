import {html, Component} from '../lib.js'
//import gsap from '../animations.js'
import Flip from 'gsap/Flip'

// Game logic
import createNewGame from '../../game/new-game.js'
import * as sounds from '../tones.js'
import {createCard} from '../../game/cards.js'
import {getCurrRoom, isCurrRoomCompleted, isDungeonCompleted} from '../../game/utils-state.js'
// import {saveToUrl, loadFromUrl} from '../save-load.js'

// UI Components
// import CampfireRoom from './campfire.js'
import Cards from './cards.js'
// import enableDragDrop from '../dragdrop.js'
// import DungeonStats from './dungeon-stats.js'
// import {DecksMap} from './Decks-map.js'
import Menu from './menu.js'
import {Overlay, OverlayWithButton} from './overlays.js'
// import {Player, Monster} from './player.js'
// import {PublishRun} from './publish-run.js'
import StartRoom from './start-room.js'
// import VictoryRoom from './victory-room.js'
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
        // Props
        this.base = undefined
        this.state = undefined
        this.game = {}
        this.overlayIndex = 11

        // Scope methods
        this.playCard = this.playCard.bind(this)
        this.handlePlayerReward = this.handlePlayerReward.bind(this)
        this.handleCampfireChoice = this.handleCampfireChoice.bind(this)
        this.handleChestReward = this.handleChestReward.bind(this)
        this.goToNextRoom = this.goToNextRoom.bind(this)
        this.toggleOverlay = this.toggleOverlay.bind(this)
        this.handleMapMove = this.handleMapMove.bind(this)
        this.dealCards = this.dealCards.bind(this)
        this.endTurn = this.endTurn.bind(this)
    }

    componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search)
        const debugMode = urlParams.has('debug')
        const demo = urlParams.has('demo')
        
        // Set up a new game
        const game = createNewGame()
        this.game = game

        if(debugMode) {
            const roomIndex = game.state.dungeon.graph[1].findIndex((r) => r.room)
            this.game.enqueue({type: 'move', move: {y: 1, x: roomIndex}})
            this.game.dequeue()
        }

        if (urlParams.has('iddqd')) {
            this.game.enqueue({type: 'iddqd'})
            this.game.dequeue()
        }

        if (urlParams.has('tutorial')) {
            setTimeout(startTutorial, 800)
        }

        // First set state without callback to ensure DOM is ready
        this.setState(game.state)
        
        // Use setTimeout to ensure the component is fully mounted before manipulating DOM
        setTimeout(() => {
            if (this.base) {
                this.dealCards()
            }
        }, 50)

        this.enableConsole()
    }

    restoreGame(oldState) {
        this.game.state = oldState
        this.setState(oldState, this.dealCards)
    }

    enableConsole() {
        // @ts-ignore
        window.dad = {
            game: this.game,
            run: this.runAction.bind(this),
            dealCards: this.dealCards.bind(this),
            nextRoom: this.goToNextRoom.bind(this),
            undo: this.undo.bind(this),
            help() {
                console.log('Welcome to the console for Dungeons and Decks. This will be used to allow certain actions to be run via commands in this console for debugging purposes')
                console.log('Some examples are dad.dealCards()')
            },
        }
        // @ts-ignore
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
        this.setState(this.game.state, this.dealCards)
    }

    /**
     * Plays a card while handling DOM animations and state updates.
     * @param {string} cardId
     * @param {string} target
     * @param {HTMLElement} cardEl
     */
    playCard(cardId, target, cardEl) {
        try {
            // Find the card in the player's hand
            const card = this.state.hand.find((c) => c.id === cardId)
            if (!card) {
                console.error('Card not found in hand:', cardId)
                return
            }
            
            // Enqueue the action
            this.game.enqueue({type: 'playCard', card, target})
            
            // Check if GSAP Flip is available
            const supportsFlip = typeof Flip !== 'undefined'
            let flip
            
            // Store flip state for hand animation if supported
            if (supportsFlip && this.base) {
                flip = Flip.getState(this.base.querySelectorAll('.Hand .Card'))
            }
            
            // Create a clone on top of the card to animate
            const clone = cardEl.cloneNode(true)
            if (!clone || !this.base) {
                throw new Error('Unable to clone card or base element not available')
            }
            
            // Position the clone
            const cardRect = cardEl.getBoundingClientRect()
            clone.style.position = 'absolute'
            clone.style.width = cardEl.offsetWidth + 'px'
            clone.style.height = cardEl.offsetHeight + 'px'
            clone.style.top = window.scrollY + cardRect.top + 'px'
            clone.style.left = window.scrollX + cardRect.left + 'px'
            clone.style.transform = ''
            
            // Add the clone to the DOM
            this.base.appendChild(clone)
            
            // Update state and re-enable dragdrop
            this.update(() => {
                if (typeof enableDragDrop === 'function' && this.base) {
                    enableDragDrop(this.base, this.playCard)
                }
                
                // Play sound effect if available
                if (sounds && sounds.playCard) {
                    sounds.playCard({card})
                }
                
                // Animate cloned card away if GSAP is available
                if (gsap && gsap.effects && gsap.effects.playCard) {
                    gsap.effects.playCard(clone).then(() => {
                        if (clone && clone.parentNode) {
                            clone.parentNode.removeChild(clone)
                        }
                    })
                } else {
                    // Simple fallback if GSAP isn't available
                    setTimeout(() => {
                        if (clone && clone.parentNode) {
                            clone.parentNode.removeChild(clone)
                        }
                    }, 500)
                }
                
                // Reposition hand using Flip if available
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
            // Still update the game state even if animation fails
            this.update()
        }
    }

    endTurn() {
        // @ts-expect-error
        const room = getCurrRoom(this.state)
        if(!this.didWinEntireGame && this.didWin && room.type === 'monster') return
        
        // Play sound effect if available
        if (sounds && sounds.endTurn) {
            sounds.endTurn()
        }
        
        // If GSAP is available, use it for hand discard animation
        if (gsap && gsap.effects && gsap.effects.discardHand) {
            gsap.effects.discardHand('.Hand .Card', {
                onComplete: reallyEndTurn.bind(this),
            })
        } else {
            // Fallback if GSAP isn't available
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
        
        // Use GSAP for card dealing animation if available
        if (gsap && gsap.effects && gsap.effects.dealCards) {
            gsap.effects.dealCards('.Hand .Card')
        }
        
        // Play sound effect if available
        if (sounds && sounds.startTurn) {
            sounds.startTurn()
        }
        
        // Enable drag and drop if available
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
        
        // Store the choice
        this.game.enqueue({type: 'makeCampfireChoice', choice, reward})
        
        // Update twice (because two actions were enqueued)
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
        console.log('Go to next room, toggling map')
        this.toggleOverlay('#Map')
    }

    toggleOverlay(el) {
        if (typeof el === 'string' && this.base) {
            el = this.base.querySelector(el)
        }
        
        if (!el) {
            console.warn('Overlay element not found')
            return
        }
        
        el.toggleAttribute('open')
        el.style.zIndex = `${this.overlayIndex}`
        this.overlayIndex++
    }

    handleShortcuts(event) {
        if(event.target.nodeName === 'INPUT') return
        const {key} = event
        const keymap = {
            e: () => this.endTurn(),
            u: () => this.undo(),
            Escape: () => {
                if (!this.base) return
                
                let openOverlays = this.base.querySelectorAll(
                    '#Deck[open], #Map[open]'
                )
                const mapOpened = this.base.querySelector('#Map')?.hasAttribute('open')
                openOverlays.forEach((el) => el.removeAttribute('open'))
                if(!mapOpened) this.toggleOverlay('#Menu')
            },
            d: () => this.toggleOverlay('#Deck'),
            m: () => this.toggleOverlay('#Map')
        }
        keymap[key] && keymap[key]()
    }

    handleMapMove(move) {
        this.toggleOverlay('#Map')
        this.setState({didPickCard: false})
        this.game.enqueue({type: 'move', move})
        this.update(this.dealCards)
    }

    render(props, state) {
        if(!state?.player) {
            return html`<div class="App loading">Loading game...</div>`
        }
        
        // @ts-expect-error
        const room = getCurrRoom(state) || { type: 'unknown' }
        const showCombat = room.type === 'monster'

        //the stuff in the template string starting at line __ is testing to get the hands to work

        return html`
            <div class="App" tabindex="0" onKeyDown=${(e) => this.handleShortcuts(e)}>
                <figure class="App-background" data-room-index=${state.dungeon.y}></figure>

                ${
                    this.isDead && 
                    html`<${Overlay}>
                        <div class="Container">
                            <h1 center>You have died!</h1>
                            <!-- Put the run stats and the button to publish the run to the back in (if that gets made) here-->
                            
                            <button onClick=${() => this.props.onLoose()}>Try again?</button>
                            </div>
                            </> `
                }
                
                ${
                    state.won &&
                    html`<${Overlay}>
                        <div class="Container CContainer--center">
                            <h1 center>You Won!</h1>
                            <!-- Add the button to "publish" the run if/when it gets made and display run stats when it gets finished-->

                            <p><button onClick=${() => this.props.onWin()}>Continue?</button></p>
                            </div>
                            </>`
                }
                
                ${room.type === 'start' && html`<${Overlay}><${StartRoom} onContinue=${this.goToNextRoom} /> </>`}

                ${
                    html`
                    <div class='Hand'>
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

                    </div>
                <//>


                <${OverlayWithButton} id="Deck" topright topright2>
                    <button class="tooltipped tooltipped-se" aria-label="All the cards you own" onClick=${() =>
                        this.toggleOverlay('#Deck')}><u>D</u>eck ${state.deck.length}</button>
                        <div class="Overlay-content">
                            <${Cards} gameState=${state} type="deck" />
                        </div>
                    <//>
            </div>
        `
    }
}