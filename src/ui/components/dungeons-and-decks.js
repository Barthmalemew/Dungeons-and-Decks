import {html, render, Component} from '../lib.js'
import SplashScreen from './splash-screen.js'
import CharacterSelectScreen from './characters-select-screen.js'
import GameScreen from './game-screen.js'
import WinScreen from './win-screen.js'
import createNewGame from '../../game/new-game.js'
import '../styles/index.css'

/** @enum {string} */
const GameModes = {
    splash: 'splash',
    gameplay: 'gameplay',
    characterSelect: 'characterSelect',
    win: 'win',
}

/**
 * Our root component for the game.
 * Controls what to render.
 */
export default class DungeonsAndDecks extends Component {
    constructor() {
        super()
        const urlParams = new URLSearchParams(window.location.search)
        const initialGameMode = urlParams.has('debug') ? GameModes.gameplay : GameModes.splash
        
        // Game object is now created within GameScreen based on character choice
        this.state = {gameMode: initialGameMode, selectedCharacter: null}
        
        this.handleNewGame = this.handleNewGame.bind(this)
        this.handleContinue = this.handleContinue.bind(this)
        this.handleWin = this.handleWin.bind(this)
        this.handleLose = this.handleLose.bind(this)
        this.handleCharacterSelected = this.handleCharacterSelected.bind(this)
    }

    async handleNewGame() {
        console.log('Transitioning to character select')
        // Reset selected character when starting a new flow
        this.setState({ selectedCharacter: null })
        await this.setState({gameMode: GameModes.characterSelect})
        window.history.pushState('', document.title, window.location.pathname)
    }

    handleContinue() {
        this.setState({gameMode: GameModes.gameplay})
    }

    handleWin() {
        this.setState({gameMode: GameModes.win})
    }

    handleLose() {
        this.setState({gameMode: GameModes.splash})
    }
    
    async handleCharacterSelected(character) {
        console.log('Character selected:', character);
        // Store the selected character data and switch to gameplay mode
        await this.setState({gameMode: GameModes.gameplay, selectedCharacter: character});
    }

    render() {
        const {gameMode} = this.state
        if (gameMode === GameModes.splash) {
            return html`<${SplashScreen} onNewGame=${this.handleNewGame} onContinue=${this.handleContinue} />`
        }
        if (gameMode === GameModes.characterSelect) {
            return html`<${CharacterSelectScreen} 
                onBack=${() => this.setState({gameMode: GameModes.splash})}
                onCharacterSelected=${this.handleCharacterSelected}
            />`
        }
        if (gameMode === GameModes.gameplay) {
            // Pass the selected character data to GameScreen
            return html`<${GameScreen} selectedCharacter=${this.state.selectedCharacter} onWin=${this.handleWin} onLoose=${this.handleLose} /> `
        }
        if (gameMode === GameModes.win) {
            return html`<${WinScreen} onNewGame=${this.handleNewGame} /> `
        }
    }
}

if (!customElements.get('dungeons-and-decks')) {
    customElements.define(
        'dungeons-and-decks',
        class DungeonsAndDecksElement extends HTMLElement {
            connectedCallback() {
                render(html` <${DungeonsAndDecks} /> `, this)
            }
        },
    )
}
