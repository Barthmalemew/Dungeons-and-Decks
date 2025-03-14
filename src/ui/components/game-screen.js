
import {Component, html} from '../lib.js'


//game logic imports
import createNewGame from '../../game/new-game.js'
//Need to import card creation from cards when they are done
//Need to import functions to test the current game condition such as the current room and its status along with whether the dungeon is complete or not
//need to import the functions that allow for character selection and handle that process


//UI component imports
//campfire room import
//cards import
//drag and drop feature import
//Map import
//player and monster import
import Menu from './menu.js'
import {Overlay, OverlayWithButtons} from './overlays.js'
import StartRoom from './start-room.js'
//character selection import
//victory room import
import startTutorial from '../intro-tutorial.js'

//extend the component class from preact to create a class to be exported that can check the very basic state of the game {isPlayerDead, didPlayerWinCombat, didPlayerWinGame}.
export default class App extends Component {
    //Function returns a bool based on if the currernt room has been cleared.
    get didWin()
    {
        //set this return to return the value of a check that sees if the current room is completed by checking the game state.
        return true;
    }
    //Function returns a bool that is the result of a check that determines if the players current health is less than one.
    get isDead()
    {
        return this.state.player.currentHealth < 1;
    }
    //function returns a bool based on if the player has completed the dungeon.
    get didWinEntireGame()
    {
        //this return should run a function that takes the state of the game and returns true or false depending on if the player has completed the dungeon.
        return false;
    }
    //constructor for the App class
    constructor()
    {
        //this is needed because when creating your own constructor for a derived class in JS you need to explicitly call the parent classes constructor
        super() 
        //Class properties
        this.base = undefined //This is a Node container that holds the entire DOM used in the gamescreen
        this.state = undefined //this is holds the current game state that is being rendered, and allows for control over when the rendered state is updated
        this.game = {} //this holds the game object 
        this.overlayIndex = 0 //this value will correspond to the zindex of the overlay in the foreground

        //Creating bound functions to ensure their variable scope
        this.playCard = this.playCard.bind(this) //this handles both the UI elements and function calls for playing cards
        this.handlePlayerReward = this.handlePlayerReward.bind(this) //this handles the UI elements and function calls for end of battle rewards
        this.handleCampfireChoice = this.handleCampfireChoice.bind(this) //this handles the UI elements and function calls for the players campfire choice
        this.handleChestReward = this.handleChestReward.bind(this) //this handles the UI elements and function calls for chest contents and maybe relic assignment based on the chests assigned rarity
        this.goToNextRoom = this.goToNextRoom.bind(this) //this bundles the UI updates and function calls used to move to the next room into a single method
        this.toggleOverlay = this.toggleOverlay.bind(this) //this handles the toggling of overlays
        this.handleMapMove = this.handleMapMove.bind(this) //this handles the UI element updates and function calls to facilitate map movement
        //There might be more of these bound funtions depending on the other game elements added
        
        /**
         * //maybe add in a relic handler although this might need to have a function in action.js to actually do the checking 
        //and this just look for the relic that proc'ed and just animate it, 
        //although we are going to need some way to check for the activation conditions and store them
        //although we could just only have relics that proc at the end or the start of the battle or some interval that is eaiser to check
         */
    }
        //This method runs when the component gets mounted to the DOM
        componentDidMount()
        {
            const urlParams = new URLSearchParams(window.location.search);
            const debugMode = urlParams.has('debug');
            const demo = urlParams.has('demo');
            //this sets up the new game
            const game = createNewGame();
            this.game = game; //this sets the variable game defined in the constructor to the value of the newly created game

            if(debugMode)
            {
                //enable console *insert a "now this is debugging"*
                this.enableConsole();
            }

            if (urlParams.has('tutorial')) {
			setTimeout(startTutorial, 800)
		    }
            
            this.setState(game.state, this.dealCards);
            //sounds effects need to be called for this

            //check if there is an already saved game
            //if we find one we should load that over the set up new game

            
        }

        //this is the function that will set the game state to the one loaded from a saved game
        loadSave(save)
        {
            this.game.state = save;
            this.setState(save,this.dealCards);
        }

        //this function will enable the console so the real debugging can happen
        enableConsole()
        {
            // @ts-ignore
            window.dad = {
                game: this.game, //this sets game variable to the state of the game
                run: this.runAction.bind(this), //this allows for actions to be executing via the console by using dad.run([insert action])
                dealCards: this.dealCards.bind(this), //this "creates" the command .dealCards that runs the dealCards function
                nextRoom: this.goToNextRoom.bind(this),
                undo: this.undo.bind(this),
                //add some more function commands for stuff so that things like animations can be tested
                help() {
                    console.log('Welcome to the console for Dungeons and Decks. This will be used to allow certain actions to be run via commands in this console for debugging purposes')
                    console.log('Some examples are dad.dealCards()')
                },
            }
            // @ts-ignore
            window.dad.help();
        }
        //this function is used to run an action and it takes the action name and any parameters that action might need through the use of props
        runAction(actionName, props)
        {
            const action = {type: actionName, ...props};
            this.game.enqueue(action) //this should use the enqueue function from the game object created by the new game function that currently has yet to be made
            this.update();
        }

        //this function updates the state by dequeueing the oldest action and then also allowing for functions to be run after the state is updated via the callback parameter
        update(callback)
        {
            this.game.dequeue();
            this.setState(this.game.state,callback);
        }
        //This function undoes the last "action"
        undo()
        {
            this.game.undo();
            this.setState(this.game.state, this.dealCards);
        }

        //playCard
        /**
         * 
         * @param {String} cardId: The id of the card being played/ used to locate the card object in the players hand
         * @param {String} target: The target of the card attempting to be played
         * @param {HTMLElement} cardEl: The HTML element connected to the card attempting to be played
         */
        playCard(cardId, target, cardEl)
        {
            //this sets the variable card to the card object from the players hand with the id property of cardId
            const card = this.state.hand.find((c) => c.id === cardId);
            this.game.enqueue({type: 'playCard',card, target}); //this is the thing actally intitating the code to play the card

            //this is where card animations should go when they get finished

            //we probably want to create a "dummy" card ot animate over such that we can snap it back to its origninal position if we need to
            /**@type {HTMLElement} */
            // @ts-expect-error
            const clone = cardEl.cloneNode(true);
            const cardRect = cardEl.getBoundingClientRect();
            clone.style.position = 'absolute';
            clone.style.width = cardEl.offsetWidth + 'px';
            clone.style.height = cardEl.offsetHeight + 'px';
            clone.style.top = window.scrollY + cardRect.top + 'px';
            clone.style.left = window.scrollX + cardRect.left + 'px';
            clone.style.transform = '';
            this.base.appendChild(clone);
            //we then want to update the state such that the damage and the over visual effects can be updated in the render
            this.update();
            //probably want to re-enable any functionality to do with moving cards around by dragging them and target assignment and checking by dropping them 

            //probably want to remove the cloned card once we are done using it for animation

            //The players hand might need to be "updated" to more properly reflect a smaller hand size now that a card has been played
        }

        //dealCards
        dealCards()
        {
            const cards = this.base.querySelectorAll('.Hand .Card');
            if (!cards?.length) return
            //animations for the cards moving from the deck (offscreen) into the players hand

            //re-enable drag and drop as well
        }


        //endTurn
        endTurn()
        {
            // @ts-expect-error
            const room = getCurrRoom(this.state);
            if(!this.didWinEntireGame && this.didWin && room.type === 'monster') return
            
            //maybe play a sound effect here

            //run the animation for the hand discard that happens when turns end
            //There is probably a way to "queue" a function to run when the animation is completed, which should finish ending the turn

            function finEndTurn()
            {
                this.game.enqueue({type: 'endTurn'});
                this.update(this.dealCards);
            }
        }

        //handlePlayerReward
        /**
         * This function handles the end of battle rewards for players, currently only has the code for card rewards but in the future will have code to handle relics
         * @param {String} choice: a string that represents the choice a player makes when getting their end of battle rewards, will be used to diff between when the player adds a new card and when they get a relic 
         * @param {Object} card: an object however might have a relic shoved in it depending on how the function plays out
         */
        handlePlayerReward(choice, card)
        {
            this.game.enqueue({type:'addCardToDeck', card});
            this.setState({didPickCard: card});
            this.update();
            this.goToNextRoom();
        }

        //handleCampfireChoice
        /**
         * this function simply just runs the corresponding function to the choice picked
         * @param {String} choice: A string representing action a player picked to do at a campfire: rest, upgrade card, or remove card
         * @param {Object} reward: This holds either a card object in the case of the choice being upgrade or remove, or nothing in the case that the choice was rest as it gets assigned a numeric value in this function
         */
        handleCampfireChoice(choice, reward)
        {
            if(choice === 'rest')
            {
                reward = Math.floor(this.game.state.player.maxHealth * 0.3);
                this.game.enqueue({type: 'addHealth', target: 'player', amount: reward});
            }
            else if(choice === 'upgradeCard')
            {
                this.game.enqueue({type: 'upgradeCard', card: reward})
                //this.game.enqueue <- add the card upgrade action to this enqueue statement and set the card value to reward
            }
            else if(choice === 'removeCard')
            {
                this.game.enqueue({type: 'removeCard', card: reward})
                //this.game.enqueue <- add the remove card action here use reward for card like with upgrade
            }
            //store the campfire choice enqueueing the campfireChoice action

            //update the game, it will have to pass another update into the update function to update the game twice
            //as not only does an action get enqueued for each of the choices but also an action get enqueued to record the choice
            this.update();
            //move to the next room
        }

        //handleChestReward
        handleChestReward(relic)
        {
            this.game.enqueue({type: 'addRelic', relic});
            this.setState({didPickRelic: relic});
            this.update();
            this.goToNextRoom();
        }

        //goToNextRoom
        goToNextRoom()
        {
            //adding a log here to make sure this funtion will run correctly in different situations
            //and also to document how this function accomplishes its task
            console.log('Function run: goToNextRoom\nEffect: toggles the map overlay');
            this.toggleOverlay('#Map');
        }

        //toggleOverlay
        /**
         * this function sets the overlay element provided to the zIndex of the overlayIndex value bringing it to the foreground and incrementing the overlayIndex value
         * @param {*} el The element or string corresponding to the overlay being toggled, if it is a string it gets casted into a HTMLElement
         */
        toggleOverlay(el)
        {
            if (typeof el === 'string') el = this.base.querySelector(el);
            el.toggleAttribute('open');
            el.style.zIndex = '${this.overlayIndex}';
            this.overlayIndex++;
        }
        
        //handle shortcuts
        handleShortcuts(event)
        {
            if(event.target.nodeName === 'INPUT') return
            const {key} = event;
            const keymap = {
                e: () => this.endTurn(),
                //u: () => this.undo(),
                //add draw pile, discard pile, and exhaust pile element ids to the query selector terms along with relic overlay that shows up when you click a relic in your inventory to get more info about it
                Escape: () => {
                    let openOverlays = this.base.querySelectorAll(
                        '#Deck[open], #Map[open]'
                    )
                    const mapOpened = document.querySelector('#Map').hasAttribute('open');
                    openOverlays.forEach((el) => el.removeAttribute('open'));
                    if(!mapOpened) this.toggleOverlay('#Menu');
                },
                //add the overlay commands for the drawpile discard pile and exhaust pile, with a for draw pile, s for discard pile, and either x, q or r for exhaust pile
                d: () => this.toggleOverlay('#Deck'),
                m: () => this.toggleOverlay('#Map')
            }
            keymap[key] && keymap[key]();
        }

        //handleMapMove
        handleMapMove(move)
        {
            this.toggleOverlay('#Map');
            this.setState({didPickCard: false});
            this.game.enqueue({type: 'move', move});
            this.update(this.dealCards);
        }


        render(props, state)
        {
            if(!state.player) return
            // @ts-expect-error
            const room = getCurrRoom(state);
            const showCombat = room.type === 'monster';

            //to Add: shortcut handler 
            //The overlay for if the player is dead
            //
            return html`
            <div class="App" tabindex="0">
                <figure class="App-background" data-room-index=${state.dungeon.y}></div>

                ${
                    this.isDead && 
                    html`<${Overlay}>
                        <div class="Container">
                            <h1 center>You have died!</h1>
                            <!-- Put the run stats and the button to publish the run to the back in (if that gets made) here-->
                            
                            <button onClick=${() => this.props.onLose()}>Try again?</button>
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

                <${OverlayWithButtons} id="Menu" topleft>
                <button onClick=${() => this.toggleOverlay('#Menu')}<u>Esc</u>ape</button>
                    <div class="Overlay-content">
                        <${Menu} gameState=${state} game=${this.game} onUndo=${() => this.undo()} />
                    </div>
                <//>

                <${OverlayWithButtons} id="Map" topright key=${1}>
                    <button align-right onClick=${() => this.toggleOverlay('#Map')}><u>M</u>ap</button>
                    <div class="Overlay-content">

                    </div>
                <//>


                <${OverlayWithButtons} id='Deck" topright topright2>
                    <button class="tooltipped tooltipped-se" aria-label="All the cards you own" onClick${() =>
                        this.toggleOverlay('#Deck')}><u>D</u>eck ${state.deck.length}</button>
                        <div class='Overlay-content">
                            <${Cards} gameState=${state} type="deck" />
                        </div>
                    <//>
                `
        }
}



