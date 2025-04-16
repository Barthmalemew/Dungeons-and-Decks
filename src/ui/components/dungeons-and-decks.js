import {html, render, Component} from '../lib.js'
import SplashScreen from './splash-screen.js'
import createNewGame from '../../game/new-game.js'
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

        // Initialize the game object early to prevent undefined errors
        if (!window.game) {
            window.game = createNewGame(urlParams.has('debug')); // Pass debug flag if present
            console.log('Game object initialized.');
        }
        this.state = {gameMode: initialGameMode}

        this.handleNewGame = this.handleNewGame.bind(this)
        this.handleContinue = this.handleContinue.bind(this)
        this.handleWin = this.handleWin.bind(this)
        this.handleLose = this.handleLose.bind(this)
        this.handleCharacterSelected = this.handleCharacterSelected.bind(this)
    }

    async handleNewGame() {
        // Optional: Reset game state if needed when starting a *truly* new game
        // For now, we assume the initial creation in the constructor is sufficient,
        // or that loading/continuing handles state appropriately.
        // If a full reset is needed: window.game = createNewGame();
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

    async handleCharacterSelected(character) {
        if (!window.game) {
            console.error("CRITICAL: window.game is still undefined in handleCharacterSelected!");
            window.game = createNewGame();
            return;
        }

        console.log('Character selected:', character);

        // First set the character
        window.game.enqueue({ type: 'setCharacter', character });
        window.game.dequeue();

        // Then set up the character's deck and stats
        window.game.enqueue({ type: 'setupCharacterDeck', character });
        window.game.dequeue();
        
        // Log player state for debugging
        console.log('Player state after setup:', JSON.parse(JSON.stringify(window.game.state.player)));

        // Draw initial hand
        window.game.enqueue({ type: 'drawCards', amount: 5 });
        window.game.dequeue();

        await this.setState({gameMode: GameModes.gameplay});
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
