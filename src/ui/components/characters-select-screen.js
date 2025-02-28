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
                //border: '/images/fighter_slot.png',
                image: '/images/warrior_real.png'
            },
            { 
                name: 'Rogue',
                //border: '/images/rogue_slot.png',
                image: '/images/rogue_real.png'
            },
            { 
                name: 'Mage',
                //border: '/images/wizard_slot.png',
                image: '/images/wizard_real.png'
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
                                    <!--<img src="${character.border}" alt="${character.border}" class="SlotImage" />-->
                                    <img src="${character.image}" alt="${character.name}" class="CharImage" />
                                </div>
                            </div>
                        </article>`
                    )}
                </section>
            </article>
        `
    }
}
