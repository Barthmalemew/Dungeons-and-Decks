import {html, Component} from '../lib.js'

export default class CharacterSelectScreen extends Component {
    constructor() {
        super()
        this.state = { selectedCharacter: null }
    }

    // Function to handle going back to the main screen
    handleBack = () => {
        this.props.onBack()
    }

    // Function to handle character selection
    handleCharacterSelected = (character) => {
        this.props.onCharacterSelected(character)
        this.selectedCharacter = character
    }

    render() {
        const characters = [
            { name: 'Warrior',  class: '💪', level: '15' },
            { name: 'Rogue',  class: '🎭', level: '13' },
            { name: 'Mage',   class: '🧙', level: '17' },
        ]

        return html`
            <article class="CharacterSelect Container">
                <header class="Head"><h1>Select Your Character</h1></header>
                <section class="CharacterGrid">
                    ${characters.map((character, index) => 
                        html`<article class="CharacterCard">
                            <div class="CharacterInfo">
                                <h2>${character.name}</h2>
                                <div class="ClassIcon">${character.class}</div>
                                <h3>Level: ${character.level}</h3>
                            </div>
                            <button 
                                class="Action"
                                onClick=${() => this.handleCharacterSelected(character)}
                                style="background: rgba(0,0,0,0.2); color: white;"
                            >
                                Select ${character.name}
                            </button>
                        </article>`
                    )}
                </section>
                <button 
                    class="BackButton"
                    onClick={this.handleBack}
                >
                    Back to Select
                </button>
            </article>
        `
    }
}
