import {produce} from 'immer'
import {clamp, shuffle} from '../utils.js'

/**
 * The core game state object
 * @typedef {object} State
 * @prop {number} createdAt
 * @prop {number} endedAt
 * @prop {boolean} won
 * @prop {number} turn
 * @prop {Array} deck
 * @prop {Array} drawPile
 * @prop {Array} hand
 * @prop {Array} discardPile
 * @prop {Array} exhaustPile
 * @prop {Player} player
 */

/**
 * The player state including D&D specific stats
 * @typedef {object} Player
 * @prop {number} currentHealth
 * @prop {number} maxHealth
 * @prop {number} armorClass
 * @prop {object} actions - D&D action economy (action, bonus action, reaction)
 * @prop {object} powers
 */

/**
 * Creates initial game state
 * @returns {State}
 */
function createNewState() {
    return {
        turn: 1,
        deck: [],
        drawPile: [],
        hand: [],
        discardPile: [],
        exhaustPile: [],
        player: {
            maxHealth: 10, // Will be based on class/level
            currentHealth: 10,
            armorClass: 10,
            actions: {
                action: true,
                bonusAction: true,
                reaction: true
            },
            powers: {},
        },
        createdAt: new Date().getTime(),
        endedAt: undefined,
        won: false,
    }
}

/**
 * Adds starter deck based on character class
 * @param {State} state
 * @returns {State}
 */
function addStarterDeck(state) {
    // We'll expand this with actual D&D-themed cards later
    const deck = [
        createCard('Attack'),
        createCard('Attack'),
        createCard('Attack'),
        createCard('Defend'),
        createCard('Defend'),
    ]
    return produce(state, (draft) => {
        draft.deck = deck
        draft.drawPile = shuffle(deck)
    })
}

/**
 * Draw X cards from deck to hand
 * @param {State} state
 * @param {object} options
 * @param {number} options.amount
 * @returns {State}
 */
function drawCards(state, options) {
    const amount = options?.amount ? options.amount : 5
    return produce(state, (draft) => {
        if (state.drawPile.length < amount) {
            draft.drawPile = state.drawPile.concat(state.discardPile)
            draft.drawPile = shuffle(draft.drawPile)
            draft.discardPile = []
        }
        const newCards = draft.drawPile.slice(0, amount)
        draft.hand = draft.hand.concat(newCards)
        for (let i = 0; i < amount; i++) {
            draft.drawPile.shift()
        }
    })
}

/**
 * Play a card from hand
 * @param {State} state
 * @param {object} params
 * @param {object} params.card
 * @param {string} params.target
 * @returns {State}
 */
function playCard(state, {card, target}) {
    if (!card) throw new Error('No card to play')
    if (!target) target = card.target

    // Check if we have the required action type available
    if (!state.player.actions[card.actionType]) {
        throw new Error(`${card.actionType} already used this turn`)
    }

    let newState = discardCard(state, {card})

    newState = produce(newState, (draft) => {
        // Use up the action
        draft.player.actions[card.actionType] = false
    })

    // Handle card effects here
    // We'll expand this as we define card types and effects

    return newState
}

const allActions = {
    createNewState,
    addStarterDeck,
    drawCards,
    playCard,
    // We'll add more actions as we need them
}

export default allActions