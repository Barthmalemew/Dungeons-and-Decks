import {html, render, Component} from '../lib.js'
import SplashScreen from './splash-screen.js'
import WinScreen from './win-screen.js'
import GameScreen from './game-screen.js'
import '../styles/index.css'
// import {init as initSounds} from '../sounds.js'

/** @enum {string} */
const GameModes = {
    splash: 'splash',
    gameplay: 'gameplay',
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
        this.handleLoose = this.handleLoose.bind(this)
    }

    async handleNewGame() {
        // await initSounds()
        this.setState({gameMode: GameModes.gameplay})
        // Clear any previous saved game.
        window.history.pushState('', document.title, window.location.pathname)
    }

    handleContinue() {
        this.setState({gameMode: GameModes.gameplay})
    }

    handleWin() {
        this.setState({gameMode: GameModes.win})
    }

    handleLoose() {
        this.setState({gameMode: GameModes.splash})
    }

    render() {
        const {gameMode} = this.state
        if (gameMode === GameModes.splash) {
            return html`<${SplashScreen} onNewGame=${this.handleNewGame} onContinue=${this.handleContinue} />`
        }
        if (gameMode === GameModes.gameplay) {
            return html`<${GameScreen} onWin=${this.handleWin} onLoose=${this.handleLoose} /> `
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