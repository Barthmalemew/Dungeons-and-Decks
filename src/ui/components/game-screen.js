
import {html, Component} from '../lib.js'
import gsap from '../animations.js'
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
import enableDragDrop from '../dragdrop.js'
// import DungeonStats from './dungeon-stats.js'
// import {DecksMap} from './Decks-map.js'
import Menu from './menu.js'
import {Overlay, OverlayWithButton} from './overlays.js'
import {Player, Monster} from './player.js'
// import {PublishRun} from './publish-run.js'
import StartRoom from './start-room.js'
// import VictoryRoom from './victory-room.js'
import startTutorial from '../intro-tutorial.js'

export default class App extends Component {
    //Function returns a bool based on if the currernt room has been cleared.
    get didWin()
    {
        //set this return to return the value of a check that sees if the current room is completed by checking the game state.
        return isCurrRoomCompleted(this.state)
    }
    get isDead() {
        return this.state.player.currentHealth < 1
    }
    //function returns a bool based on if the player has completed the dungeon.
    get didWinEntireGame()
    {
        //this return should run a function that takes the state of the game and returns true or false depending on if the player has completed the dungeon.
        return isDungeonCompleted(this.state)
    }
    //constructor for the App class
    constructor()
    {
        //this is needed because when creating your own constructor for a derived class in JS you need to explicitly call the parent classes constructor
        super() 
        //Class properties
        this.base = undefined //This is a Node container that holds the entire DOM used in the gamescreen
        this.state = undefined //this is holds the current game state that is being rendered, and allows for control over when the rendered state is updated
        /**@type {import('../../game/new-game.js').Game}  */
        this.game = {} //this holds the game object 
        this.overlayIndex = 11 //this value will correspond to the zindex of the overlay in the foreground

        // Scope methods Creating bound functions to ensure their variable scope
        this.playCard = this.playCard.bind(this) //this handles both the UI elements and function calls for playing cards
        this.handlePlayerReward = this.handlePlayerReward.bind(this) //this handles the UI elements and function calls for end of battle rewards
        this.handleCampfireChoice = this.handleCampfireChoice.bind(this) //this handles the UI elements and function calls for the players campfire choice
        this.handleChestReward = this.handleChestReward.bind(this) //this handles the UI elements and function calls for chest contents and maybe relic assignment based on the chests assigned rarity
        this.goToNextRoom = this.goToNextRoom.bind(this) //this bundles the UI updates and function calls used to move to the next room into a single method
        this.toggleOverlay = this.toggleOverlay.bind(this) //this handles the toggling of overlays
        this.handleMapMove = this.handleMapMove.bind(this) //this handles the UI element updates and function calls to facilitate map movement
        //this.dealCards = this.dealCards.bind(this)
        //this.endTurn = this.endTurn.bind(this)
    }

     //This method runs when the component gets mounted to the DOM
    componentDidMount()
    {
        console.log("ComponentDidMount() lifecycle")
         const urlParams = new URLSearchParams(window.location.search)
         const debugMode = urlParams.has('debug')
         const demo = urlParams.has('demo')
         //this sets up the new game
         const game = createNewGame()
         this.game = game; //this sets the variable game defined in the constructor to the value of the newly created game

         if(demo || 1)
         {
            /**
             * Other things we might want to demo/tutorial to do
             * just rewrite over the game with a different createNewGame that gives a curated starting deck
             * maybe even set the character class
             * probably should also set the players level
             * and give them some relics(maybe)
             */
             //const roomIndex will be the room we want to move to preplanned for the demo 
             //we will find it using findIndex on the dungeon graph array
            const roomIndex = game.state.dungeon.graph[1].findIndex((r) => r.room)
             //then move the player to this room by enqueuing a move action
            this.game.enqueue({type: 'move', move: {y: 1, x: roomIndex}})
            this.game.dequeue()
         }
         if(debugMode || 1)
         {
             //enable console *insert a "now this is debugging"*
             this.enableConsole()
         }
         if (urlParams.has('tutorial')) {
            setTimeout(startTutorial, 800)
        }
        
        //check if there is an already saved game
        //if we find one we should load that over the set up new gam

        // First set state without callback to ensure DOM is ready
        this.setState(game.state, this.dealCards)
        if(this.game.state.player)
        {
            console.log(`The state is set correctly and player evaluates to ${Object.prototype.toString.call(this.game.state.player)}`)
        }
        else{
            console.warn(`State is not set correctly as player evaluates to ${Object.prototype.toString.call(this.game.state.player)}`)
        }
        
        //callback functions fulfill this purpose already so this code is not needed as setState is passed dealCards as a callback function ensuring it is only ran once that state has been set
        // Use setTimeout to ensure the component is fully mounted before manipulating DOM
        /* setTimeout(() => {
            if (this.base) {
                this.dealCards()
            }
        }, 50) */

    }

    restoreGame(oldState) {
        this.game.state = oldState
        this.setState(oldState, this.dealCards)
    }
//this function will enable the console so the real debugging can happen
enableConsole()
{
    // @ts-ignore
    window.dad = {
        game: this.game, //this sets game variable to the state of the game
        run: this.runAction.bind(this), //this allows for actions to be executing via the console by using dad.run([insert action])
        dealCards: this.dealCards.bind(this), //this "creates" the command .dealCards that runs the dealCards function
        createCard,
        nextRoom: this.goToNextRoom.bind(this),
        undo: this.undo.bind(this),
        //add some more function commands for stuff so that things like animations can be tested
        help() {
            console.log('Welcome to the console for Dungeons and Decks. This will be used to allow certain actions to be run via commands in this console for debugging purposes')
            console.log('Some examples are dad.dealCards()')
        },
    }
    // @ts-ignore
    window.dad.help()
}

    //this function is used to run an action and it takes the action name and any parameters that action might need through the use of props
    runAction(actionName, props) {
        const action = {type: actionName, ...props}
        this.game.enqueue(action)
        this.update()
    }
    //this function updates the state by dequeueing the oldest action and then also allowing for functions to be run after the state is updated via the callback parameter
    update(callback) {
        this.game.dequeue()
        this.setState(this.game.state, callback)
    }
    //This function undoes the last "action"
    //we need to "fix" the issue where because we don't have a functioning start room, hitting undo on the first room "undoes" the last move and just kinda softlocks 
    undo() {
        this.game.undo()
        this.setState(this.game.state,this.dealCards)
    }

    /**
         * This intitates a playCard action and the animation for playing cards
         * @param {String} cardId: The id of the card being played/ used to locate the card object in the players hand
         * @param {String} target: The target of the card attempting to be played
         * @param {HTMLElement} cardEl: The HTML element connected to the card attempting to be played
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

    //handleCampfireChoice
    /**
    * this function simply just runs the corresponding function to the choice picked
    * @param {String} choice: A string representing action a player picked to do at a campfire: rest, upgrade card, or remove card
    * @param {Object} reward: This holds either a card object in the case of the choice being upgrade or remove, or nothing in the case that the choice was rest as it gets assigned a numeric value in this function
    */
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

          
    //goToNextRoom
    goToNextRoom()
    {
        //adding a log here to make sure this funtion will run correctly in different situations
        //and also to document how this function accomplishes its task
        console.log('Function run: goToNextRoom\nEffect: toggles the map overlay')
        this.toggleOverlay('#Map')
    }

    //toggleOverlay
    /**
     * this function sets the overlay element provided to the zIndex of the overlayIndex value bringing it to the foreground and incrementing the overlayIndex value
     * @param {*} el The element or string corresponding to the overlay being toggled, if it is a string it gets casted into a HTMLElement
     */
    toggleOverlay(el) {
        //changed from if(typeof el === 'string' && this.base) as this if statement is never true since 1. a string cant also be part of the base and 
        //2. this function sometimes recieves a string tied to a class/id value and sometimes recieves a HTMLelement so it needs a way to find the HTMLelement from the string
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

    //handle shortcuts
    handleShortcuts(event) {
        if (event.target.nodeName === 'INPUT') return
        const { key } = event
        const keymap = {
            e: () => this.endTurn(),
            u: () => this.undo(),
            //add draw pile, discard pile, and exhaust pile element ids to the query selector terms along with relic overlay that shows up when you click a relic in your inventory to get more info about it
            Escape: () => {
                let openOverlays = this.base.querySelectorAll(
                    '#Deck[open], #Map[open], #DrawPile[open], #DiscardPile[open], #ExhaustPile[open]',
                )
                //might need to change document to this.base
                const mapOpened = document.querySelector('#Map').hasAttribute('open')
                openOverlays.forEach((el) => el.removeAttribute('open'))
                if (!mapOpened) this.toggleOverlay('#Menu')
            },
            //add the overlay commands for the drawpile discard pile and exhaust pile, with a for draw pile, s for discard pile, and either x, q or r for exhaust pile
            d: () => this.toggleOverlay('#Deck'),
            m: () => this.toggleOverlay('#Map'),
            a: () => this.toggleOverlay('#DrawPile'),
            s: () => this.toggleOverlay('#DiscardPile'),
            x: () => this.toggleOverlay('#ExhaustPile')
        }
        //Don't mind that this isn't an optional chain expression because this is backup if the optional chaining doesnt work
        //keymap[key] && keymap[key]();
        //This is optional chaining but idk if it works for this case
        //this returns an error if a a key that isnt defined is 
        keymap?.[key]?.()
    }

    handleMapMove(move) {
        this.toggleOverlay('#Map')
        this.setState({didPickCard: false})
        this.game.enqueue({type: 'move', move})
        this.update(this.dealCards)
    }


        render(props, state)
        {
            console.log("render() lifecycle")
            //if(!state.player) return
            if(!state?.player) {
                return html`<div class="App loading">Loading game...</div>`
            }
            
            const room = getCurrRoom(state) || { type: 'unknown' }
            const showCombat = room.type === 'monster'

            //to Add: shortcut handler 
            //The overlay for if the player is dead
            //
            return html`
            <div class="App" tabindex="0" onkeydown=${(e) => this.handleShortcuts(e)}>
                <figure class="App-background" data-room-index=${state.dungeon.y}></div>

                ${
                    this.isDead && 
                    html`<${Overlay}>
                        <div class="Container">
                            <h1 center>You have died!</h1>
                            <!-- Put the run stats and the button to publish the run to the back in (if that gets made) here-->
                            
                            <button onClick=${() => this.props.onLoose()}>Try again?</button>
                            </div>
                            <//> `
                }
                
                ${
                    state.won &&
                    html`<${Overlay}>
                        <div class="Container CContainer--center">
                            <h1 center>You Won!</h1>
                            <!-- Add the button to "publish" the run if/when it gets made and display run stats when it gets finished-->

                            <p><button onClick=${() => this.props.onWin()}>Continue?</button></p>
                            </div>
                            <//>`
                }
                
                ${room.type === 'start' && html`<${Overlay}><${StartRoom} onContinue=${this.goToNextRoom} /> <//>`}
                
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