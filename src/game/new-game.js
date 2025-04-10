import actions from './actions.js'
import ActionManager from './action-manager.js'

/** @typedef {import('./actions.js').State} State */

/**
 * @typedef {object} Game
 * @prop {State} state
 * @prop {object} actions
 * @prop {Function} enqueue - stores an action in the "future"
 * @prop {Function} dequeue - runs the oldest "future" action, and stores result in the "past"
 * @prop {Function} undo - undoes the last "past" action
 * @prop {{list: Array<{type: string}>}} future
 * @prop {{list: Array<{action: string, state: State}>}} past
 */

/**
 * Creates a new game
 * @param {boolean} debug - whether to log actions to the console
 * @param {object} [characterData] - Optional data for the selected character
 * @returns {Game} game - A game object holding the beginning state, initialized with character data if provided
 */
export default function createNewGame(debug = false, characterData = null) {
    const actionManager = ActionManager({debug})

    /**
     * @param {object} [charData] - Character data passed from createNewGame to initialize state
     * @returns {State} with a dungeon, start deck and cards drawn
     */
    function createInitialState(charData = null) {
        console.log("createInitialState received characterData:", charData); // Added console log
        let state = actions.createNewState(undefined, charData); // Pass character data to createNewState
        state = actions.setDungeon(state)
        state = actions.addStarterDeck(state, charData); // Pass character data to addStarterDeck
        state = actions.drawCards(state)
        return state
    }

    return {
        state: createInitialState(characterData),
        actions,
        enqueue: actionManager.enqueue,
        dequeue() {
            try {
                const nextState = actionManager.dequeue(this.state)
                if (nextState) this.state = nextState
            } catch (err) {
                console.warn(err)
            }
        },
        undo() {
            const prevGame = actionManager.undo()
            if (prevGame) this.state = prevGame.state
            return prevGame
        },
        future: actionManager.future,
        past: actionManager.past,
    }
}
