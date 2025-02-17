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
            { 
                name: 'Warrior',
                image: '/images/image1x1.png'
            },
            { 
                name: 'Rogue',
                image: '/images/image2x1.png'
            },
            { 
                name: 'Mage',
                image: '/images/image3x1.png'
            }
        ]

        return html`
            <article class="CharacterSelect Container">
                <header class="Head"><h1>Select Your Character</h1></header>
                <section class="CharacterGrid">
                    ${characters.map((character, index) => 
                        html`<article class="CharacterCard" 
                            onClick=${() => this.props.onCharacterSelected(character)}>
                            <div class="CharacterInfo">
                                <h2>${character.name}</h2>
                                <div class="CharacterFrame">
                                    <img src="${character.image}" alt="${character.name}" />
                                </div>
                            </div>
                        </article>`
                    )}
                </section>
            </article>
        `
    }
}
