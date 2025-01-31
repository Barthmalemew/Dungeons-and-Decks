import {Queue} from '../utils.js'

// Define our basic types for TypeScript support
/**
 * @typedef {object} FutureAction
 * @prop {string} type - the name of a function in actions.js
 * @prop {any} [any] - arguments are passed to the action
 */

/**
 * @typedef {object} PastAction
 * @prop {string} type - the name of a function in actions.js
 * @prop {State} state
 */

/**
 * @typedef {object} ActionManager
 * @prop {function(FutureAction):void} enqueue
 * @prop {function(State):State} dequeue
 * @prop {function():PastAction} undo
 * @prop {Queue} future
 * @prop {Queue} past
 */

/**
 * Creates an action manager to handle game state changes
 * @param {object} props
 * @param {boolean} props.debug - whether to log actions to the console
 * @returns {ActionManager}
 */
export default function ActionManager(props) {
    const future = new Queue()
    const past = new Queue()

    function enqueue(action) {
        if (props.debug) console.log('am:enqueue', action)
        future.enqueue({action})
    }

    function dequeue(state) {
        const {action} = future.dequeue() || {}
        if (props.debug) console.log('am:dequeue', action)
        if (!action) return state

        let nextState
        try {
            nextState = actions[action.type](state, action)
        } catch (err) {
            console.warn('am:Failed running action', action)
            throw new Error(err)
        }
        past.enqueue({action, state})
        return nextState
    }

    function undo() {
        if (props.debug) console.log('am:undo')
        return this.past.list.pop()
    }

    return {
        enqueue,
        dequeue,
        undo,
        future,
        past,
    }
}