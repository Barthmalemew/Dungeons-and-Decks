// =============================================================================
// Action Manager Module
// Implements a queue-based system for managing game state actions and undo functionality
// Similar to Redux or command pattern, but with explicit past/future state tracking
// =============================================================================

import actions from './actions.js'
import {Queue} from '../utils.js'

// Type imports for TypeScript/JSDoc documentation
/** @typedef {import('./actions.js').State} State */

/**
 * Represents an action waiting to be executed
 * These are stored in the future queue
 * @typedef {object} FutureAction
 * @prop {string} type - Name of the action function to execute (must exist in actions.js)
 * @prop {any} [any] - Optional parameters to pass to the action function
 */

/**
 * Represents an action that has been executed
 * These are stored in the past queue for undo functionality
 * @typedef {object} PastAction
 * @prop {string} type - Name of the action that was executed
 * @prop {State} state - Complete game state before this action was executed
 */

/**
 * Main interface for the Action Manager
 * Provides methods to queue actions, execute them, and undo them
 * @typedef {object} ActionManager
 * @prop {function(FutureAction):void} enqueue - Add new action to future queue
 * @prop {function(State):State} dequeue - Execute oldest action and return new state
 * @prop {function():PastAction} undo - Revert most recent action
 * @prop {Queue} future - Queue of pending actions
 * @prop {Queue} past - Queue of executed actions with their previous states
 */

/**
 * Creates a new Action Manager instance
 * The Action Manager coordinates all state changes through a queue system,
 * allowing for predictable state updates and undo functionality
 * 
 * @param {object} props - Configuration options
 * @param {boolean} props.debug - Whether to log actions to console
 * @returns {ActionManager} New Action Manager instance
 */
export default function ActionManager(props) {
    // Initialize queues for tracking future and past actions
    const future = new Queue()
    const past = new Queue()

    /**
     * Adds a new action to the future queue
     * Actions in the future queue are pending execution
     * 
     * @param {FutureAction} action - Action to be queued
     */
    function enqueue(action) {
        if (props.debug) console.log('am:enqueue', action)
        future.enqueue({action})
    }

    /**
     * Executes the oldest pending action from the future queue
     * The action is executed on the current state, then moved to the past queue
     * along with the pre-execution state (for undo support)
     * 
     * @param {State} state - Current game state
     * @returns {State} New state after action execution
     */
    function dequeue(state) {
        // Get the oldest pending action
        const {action} = future.dequeue() || {}
        if (props.debug) console.log('am:dequeue', action)
        if (!action) return state

        // Execute the action to get new state
        let nextState
        try {
            nextState = actions[action.type](state, action)
        } catch (err) {
            console.warn('am:Failed running action', action)
            console.warn(err)
            throw new Error(err)
        }

        // Store action and pre-execution state in past queue
        past.enqueue({action, state})
        return nextState
    }

    /**
     * Retrieves the most recently executed action and its pre-execution state
     * Used to support undo functionality
     * 
     * @returns {PastAction} Most recent action and its previous state
     */
    function undo() {
        if (props.debug) console.log('am:undo')
        return this.past.list.pop()
    }

    // Return public interface
    return {
        enqueue,
        dequeue,
        undo,
        future,
        past,
    }
}