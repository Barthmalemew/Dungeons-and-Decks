import {html, render, Component} from '../lib.js'
import SplashScreen from './splash-screen.js'
import CharacterSelectScreen from './characters-select-screen.js'
import GameScreen from './game-screen.js'
import WinScreen from './win-screen.js'
import '../styles/index.css'
import '../styles/map.css'


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

        this.state = {gameMode: initialGameMode}

        this.handleNewGame = this.handleNewGame.bind(this)
        this.handleContinue = this.handleContinue.bind(this)
        this.handleWin = this.handleWin.bind(this)
        this.handleLoose = this.handleLose.bind(this)
        this.handleCharacterSelected = this.handleCharacterSelected.bind(this)
    }

    async handleNewGame() {
        console.log('Transitioning to character select')
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

    handleCharacterSelected(character) {
        // Store character in game state
        window.game.state.character = character
        console.log('Character selected:', character.name)
        this.setState({gameMode: GameModes.gameplay})
    }

    initializeCharacterStats(character) {
        window.game.state.player.maxHealth = character.health
        window.game.state.player.currentHealth = character.health
        window.game.state.player.maxEnergy = character.energy
        window.game.state.player.currentEnergy = character.energy
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
            return html`<${GameScreen} onWin=${this.handleWin} onLoose=${this.handleLose} /> `
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
