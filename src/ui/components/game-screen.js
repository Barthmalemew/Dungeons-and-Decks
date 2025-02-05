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
}

//Need to write the constructor for the App class.

