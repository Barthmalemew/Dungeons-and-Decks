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
        componentDidMount()
        {
            
        }
}



