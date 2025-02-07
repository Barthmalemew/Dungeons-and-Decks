import {Component, html} from '../lib.js'

//game logic imports
//Need an import for the new game script
//Need to import card creation from cards when they are done
//Need to import functions to test the current game condition such as the current room and its status along with whether the dungeon is complete or not
//need to import the functions that allow for character selection and handle that process


//UI component imports
//campfire room import
//cards import
//drag and drop feature import
//Map import
//player and monster import
//menu import
//overlay import
//start room import
//character selection import
//victory room import

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
        //this return statement needs to compare the players current health to see if its less than one when the state of the game is accessable.
        return false;
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
        this.base = undefined //This is a Node container that will help in changing between overlays based on either the current or future state of the game
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

            //this sets up the new game, this function currently does nothing as it is waiting on an import 
            const game = createNewGame();
            this.game = game; //this sets the variable game defined in the constructor to the value of the newly created game

            this.setState(game.state, this.dealCards);
            //sounds effects need to be called for this

            //check if there is an already saved game
            //if we find one we should load that over the set up new game

            //enable console *insert a "now this is debugging"*
            this.enableConsole();
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
                //add some more function commands for stuff so that things like animations can be tested
                help() {
                    console.log('Welcome to the console for Dungeons and Decks. This will be used to allow certain actions to be run via commands in this console for debugging purposes')
                    console.log('Some examples are dad.dealCards()')
                },
            }
            //@ts-ignore
            window.dad.help();
        }
        //this function is used to run an action and it takes the action name and any parameters that action might need through the use of props
        runAction(actionName, props)
        {
            const action = {type: actionName, ...props};
            this.game.enqueue(action); //this should use the enqueue function from the game object created by the new game function that currently has yet to be made
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
            const clone = cardEl.cloneNode(true);
            const cardRect = cardEl.getBoundingClientRect();
            clone.style.position = 'absolute';


            this.base.appendChild(clone);
            //we then want to update the state such that the damage and the over visual effects can be updated in the render
            this.update();
            //probably want to re-enable any functionality to do with moving cards around by dragging them and target assignment and checking by dropping them 

            //probably want to remove the cloned card once we are done using it for animation

            //The players hand might need to be "updated" to more properly reflect a smaller hand size now that a card has been played
        }

        //dealCards


        //endTurn
        endTurn()
        {
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

        //handleCampfireChoice

        //handleChestReward

        //goToNextRoom

        //toggleOverlay

        //handleMapMove
}



