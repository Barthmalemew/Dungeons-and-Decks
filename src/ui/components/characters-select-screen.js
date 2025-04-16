import {html, Component} from '../lib.js'

// Character selection screen with character stats and descriptions
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
        // Define character data with stats and descriptions
        const characters = [
            { 
                name: 'Warrior',
                border: '/images/fighter_slot.png',
                image: '/images/fighter_char.png',
                health: 80,
                energy: 3,
                description: 'A stalwart fighter with high health and strong defensive abilities.',
                startingDeck: ['Strike', 'Strike', 'Strike', 'Strike', 'Shield', 'Shield', 'Shield', 'Shield', 'Bash']
            },
            { 
                name: 'Rogue',
                border: '/images/rogue_slot.png',
                image: '/images/rogue_char.png',
                health: 60,
                energy: 3,
                description: 'A nimble fighter who excels at quick attacks and evasion.',
                startingDeck: ['Strike', 'Strike', 'Strike', 'ShadowWalk', 'Shield', 'Shield', 'UnrelentingBarrage', 'Shadow']
            },
            { 
                name: 'Mage',
                border: '/images/wizard_slot.png',
                image: '/images/wizard_char.png',
                health: 50,
                energy: 4,
                description: 'A powerful spellcaster with high energy but lower health.',
                startingDeck: ['Strike', 'Strike', 'Strike', 'Shield', 'Shield', 'TrueStrike', 'TrueStrike']
            }
        ]

        // Render character selection grid with character info
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
                                    <img src="${character.border}" alt="${character.border}" class="SlotImage" />
                                    <img src="${character.image}" alt="${character.name}" class="CharImage" />
                                </div>
                                <div class="Stats">
                                    <p>Health: ${character.health}</p>
                                    <p>Energy: ${character.energy}</p>
                                </div>
                                <div class="Description">
                                    <p>${character.description}</p>
                                </div>
                            </div>
                        </article>`
                    )}
                </section>
            </article>
        `
    }
}
