// =============================================================================
// Card-Based Dungeon Crawler Game State Management System
// This module implements a complete state management system for a roguelike
// deck-building game similar to Slay the Spire. It handles all game mechanics
// including combat, card management, dungeon navigation, and status effects.
// =============================================================================

import {produce, enableMapSet} from 'immer'
import {clamp, shuffle, pick} from '../utils.js'
import {isDungeonCompleted, getRoomTargets, getCurrRoom} from './utils-state.js'
import powers from './powers.js'
import {conditionsAreValid} from './conditions.js'
import {createCard, CardTargets} from './cards.js'
import {dungeonWithMap} from '../content/dungeon-encounters.js'

// Enable Immer's Map/Set support for immutable state updates
enableMapSet()

// Type imports for TypeScript/JSDoc documentation
/** @typedef {import('./dungeon.js').Dungeon} Dungeon */
/** @typedef {import('./cards.js').CARD} CARD */
/** @typedef {import('./rooms.js').Room} Room */
/** @typedef {import('./cards.js').CardPowers} CardPowers */

/**
 * Action Function Type Definition
 * All state changes must go through action functions to maintain immutability
 * and ensure predictable state updates throughout the game.
 * @template T - Type for optional action parameters
 * @callback ActionFn
 * @param {State} state - Current game state to be transformed
 * @param {T} [props] - Optional parameters for the action
 * @returns {State} - New immutable state after the action
 */

/**
 * Core Game State Type Definition
 * This is the central state object that maintains all game data.
 * It follows a similar pattern to games like Slay the Spire with
 * distinct piles for cards and various game status trackers.
 * @typedef {object} State
 * @prop {number} createdAt - Timestamp when game started
 * @prop {number} endedAt - Timestamp when game ended (undefined if ongoing)
 * @prop {boolean} won - Whether player has achieved victory
 * @prop {number} turn - Current game turn number
 * @prop {Array} deck - Complete collection of player's cards
 * @prop {Array} drawPile - Cards available to draw from
 * @prop {Array} hand - Cards currently in player's hand
 * @prop {Array} discardPile - Cards that have been played/discarded
 * @prop {Array} exhaustPile - Cards removed from play (usually permanently)
 * @prop {Player} player - Current player state
 * @prop {Dungeon} [dungeon] - Current dungeon state (optional until set)
 */

/**
 * Player State Type Definition
 * Tracks all attributes and status effects for the player character
 * @typedef {object} Player
 * @prop {number} currentEnergy - Available energy for playing cards
 * @prop {number} maxEnergy - Maximum energy per turn
 * @prop {number} maxEnergyC - Maximum energy per turn for combat as per combat changes to max energy are possible
 * @prop {number} currentHealth - Current health points
 * @prop {number} maxHealth - Maximum possible health
 * @prop {number} block - Current defensive shield/block points
 * @prop {object} powers - Active status effects/powers
 * @prop {object} class - Tracks the players active class, used in reward card selection
 * @prop {object} nextTurn - Tracks any additions to the start of turn values from cards/powers, like extra energy, starting with block, and drawing more cards 
 */

/**
 * Creates initial game state with default values
 * This is the entry point for starting a new game
 * @param {State} [state] - Optional initial state (unused here but good practice)
 * @param {object} [characterData] - Optional character data (health, energy) for initialization
 * @returns {State} Fresh game state with default values
 */
function createNewState(state, characterData = null) {
    console.log("createNewState received characterData:", characterData);
    return {
        turn: 1,
        deck: [],
        drawPile: [],
        hand: [],
        discardPile: [],
        exhaustPile: [],
        player: {
            maxEnergy: characterData?.energy || 3,
            maxEnergyC: characterData?.energy || 3,
            currentEnergy: characterData?.energy || 3,
            maxHealth: characterData?.health || 72,
            currentHealth: characterData?.health || 72,
            block: 0,
            powers: {},
            class : {
                Red: characterData?.class.Red || false,
                Green: characterData?.class.Green || false,
                Purple: characterData?.class.Purple || false,
            },
            //this object will hold values that will get added to the respective values at the start of the next turn, and then will be set back to zero
            nextTurn: {
                energy: 0, //amount of extra energy to add at the start of the next turn
                block: 0, //amount of block to add at the start of next turn
                drawAmt: 0, //amount of extra cards to draw next turn
                maxEnergy: 0, //amount to add to max energy for a combat, will be set with a power that lasts per combat
            },
        },
        dungeon: undefined,
        createdAt: new Date().getTime(),
        endedAt: undefined,
        won: false,
    }
}

/**
 * Assigns a dungeon to the game state
 * New games start without a dungeon - it must be explicitly set
 * @param {State} state - Current game state
 * @param {Dungeon} [dungeon] - Dungeon to use (generates new one if not provided)
 * @returns {State} Updated state with dungeon
 */
function setDungeon(state, dungeon) {
    if (!dungeon) dungeon = dungeonWithMap()
    state.dungeon = dungeon
    return state
}

/**
 * Creates and adds starter deck to game
 * This provides the basic cards every player starts with
 * Creates deck based on character data if provided, otherwise uses default.
 * @param {object} [characterData] - Optional character data with a `startingDeck` list of card names
 * @param {State} state - Current game state
 * @returns {State} Updated state with starter deck added
 */
function addStarterDeck(state, characterData = null) {
    let deck = [];
    if (characterData?.startingDeck && Array.isArray(characterData.startingDeck)) {
        // Create deck based on character data
        console.log("Creating deck from character data:", characterData.startingDeck);
        deck = characterData.startingDeck.map(cardName => createCard(cardName));
    } else {
        // Default starter deck if no character data or invalid startingDeck
        console.log("Creating default starter deck.");
        deck = [
            // Basic defensive cards (4)
            createCard('Shield'),
            createCard('Shield'),
            createCard('Shield'),
            // Basic attack cards (5)
            createCard('Strike'),
            createCard('Strike'),
            createCard('Strike'),
            // Special starter card (1)
            //createCard('Spell Slot lvl 1')
        ]
    }
    
    //debug cards
    deck.push(createCard('Poison Spray'))
    return produce(state, (draft) => {
        draft.deck = deck
        draft.drawPile = shuffle(deck)
    })
}

/**
 * Draws specified number of cards from draw pile to hand
 * Handles deck recycling when draw pile is depleted
 * @type {ActionFn<{amount: number}>}
 */
function drawCards(state, options) {
    const amount = options?.amount ? options.amount : 5
    return produce(state, (draft) => {
        // Handle deck recycling when draw pile is too small
        if (state.drawPile.length < amount) {
            // Combine remaining cards with discard pile
            draft.drawPile = state.drawPile.concat(state.discardPile)
            draft.drawPile = shuffle(draft.drawPile)
            draft.discardPile = []
        }
        const newCards = draft.drawPile.slice(0, amount)
        // Add cards to hand and remove from draw pile
        draft.hand = draft.hand.concat(newCards)
        for (let i = 0; i < amount; i++) {
            draft.drawPile.shift()
        }
    })
}

/**
 * Adds a card directly to player's hand
 * Useful for card effects that generate new cards
 * @type {ActionFn<{card: CARD}>}
 */
function addCardToHand(state, {card}) {
    console.log(`From addCardToHand\ncard being added: `,card)
    return produce(state, (draft) => {
        draft.hand.push(card)
    })
}

/**
 * This adds a card to the players hand specified by cardName and should upgrade as the other addCardToHand function only allows one to add a copy of the card that triggered this effect to a players hand
 * @type {ActionFn<{cardName: String,shouldUpgrade: boolean, card: CARD}>}
 */
function _addCardToHand(state, {cardName,shouldUpgrade, card}) {
    console.log(`From _addCardToHand\nCard Invoking the creation of others: `,card)
    const cardz = createCard(cardName, shouldUpgrade)
    console.log(`From _addCardToHand cardz object: `, cardz)
    let newState = addCardToHand(state, {card: cardz})
    return newState
}

/**
 * 
 * @type {ActionFn<{cardN1: String, cardN2: String, cardN3: String, shouldUpgrade: Boolean, card: CARD}}
 */
function addCardToHandRand(state, {cardN1, cardN2, cardN3, shouldUpgrade, card}) {
    console.log('Card that is invoking the addCardToHandRand action\n',card)
    let choosenCard = pick([cardN1,cardN2,cardN3])
    console.log('card name' + choosenCard)
    const cardRC = createCard(choosenCard, shouldUpgrade)
    let newState = addCardToHand(state, {card: cardRC})
    return newState
}

/**
 * Discards a single card from hand
 * Handles both normal discard and exhaust effects
 * @type {ActionFn<{card: CARD}>}
 */
function discardCard(state, {card}) {
    return produce(state, (draft) => {
        draft.hand = state.hand.filter((c) => c.id !== card.id)
        if (card.exhaust) {
            draft.exhaustPile.push(card)
        } else {
            draft.discardPile.push(card)
        }
    })
}

/**
 * Discards entire hand
 * Used at end of turn or by certain card effects
 * @type {ActionFn<{}>}
 */
function discardHand(state) {
    return produce(state, (draft) => {
        draft.hand.forEach((card) => {
            if(card.etheral)
            {
                draft.exhaustPile.push(card)
            } 
            else
            {
                draft.discardPile.push(card)
            }
        })
        draft.hand = []
    })
}

/**
 * Permanently removes a card from deck
 * Used for card removal events/shops
 * @type {ActionFn<{card: object}>}
 */
function removeCard(state, {card}) {
    return produce(state, (draft) => {
        draft.deck = state.deck.filter((c) => c.id !== card.id)
    })
}

/**
 * Upgrades a card to its enhanced version
 * Usually done at rest sites
 * @type {ActionFn<{card: object}>}
 */
function upgradeCard(state, {card}) {
    return produce(state, (draft) => {
        const index = draft.deck.findIndex((c) => c.id === card.id)
        draft.deck[index] = createCard(card.name, true)
    })
}

/**
 * Core card playing logic
 * Handles targeting, energy cost, damage calculation, and power application
 * Target format: "player" for self or "enemyX" where X is monster index
 * @type {ActionFn<{card: object, target?: string}>}
 */
function playCard(state, {card, target}) {
    // Validation checks
    if (!card) throw new Error('No card to play')
    if (!target) target = card.target
    if (typeof target !== 'string') throw new Error(`Wrong target to play card: ${target},${card.target}`)
    if (target === 'enemy') throw new Error('Wrong target, did you mean "enemy0" or "allEnemies"?')
    if (state.player.currentEnergy < card.energy) throw new Error('Not enough energy to play card')

    // Start by discarding the played card
    let newState = discardCard(state, {card})

    // Handle energy cost and block effects
    newState = produce(newState, (draft) => {
        draft.player.currentEnergy = newState.player.currentEnergy - card.energy
        if (card.block) {
            draft.player.block = newState.player.block + card.block
            console.log('testing to find cause of block error\nBlock: %d\ndex: %d\nBlock + dex: %d\n',draft.player.block,newState.player.powers.dexterity,draft.player.block + powers.dexterity.use(newState.player.powers.dexterity))
            if(newState.player.powers.dexterity)
            {
                draft.player.block += powers.dexterity.use(newState.player.powers.dexterity)
            }
        }
    })

    // Handle attack/damage effects
    if (card.type === 'attack' || card.damage) {
        //a loop should propably start here looking for the power dblAttack and do a decrementing for loop through the stacks
        const newTarget = card.target === CardTargets.allEnemies ? card.target : target
        let amount = card.damage
        // Apply strength modifier
        if (newState.player.powers?.strength) {
            amount = amount + powers.strength.use(newState.player.powers.strength)
        }
        if(newState.player.powers?.tempStrength) {
            amount = amount + powers.tempStrength.use(newState.player.powers.tempStrength)
        }
        // Apply weakness modifier
        if (newState.player.powers.weak) {
            amount = powers.weak.use(amount)
            
        }
        newState = removeHealth(newState, {target: newTarget, amount})
        //this loop needs to encompass card actions and powers as well
        while(powers.dblAttack.use(newState.player.powers.dblAttack) > 0) {
            newState = removeHealth(newState, { target: newTarget, amount })
            newState = decreasePowerC(newState, 'dblAttack')
        }
    }

    // Apply any power effects from the card
    if (card.powers) newState = applyCardPowers(newState, {target, card})

    // Execute any additional card actions
    newState = useCardActions(newState, {target, card})
    return newState
}

/**
 * Processes card action list
 * Called during card play to handle special effects
 * @type {ActionFn<{card: object, target?: string}>}
 */
export function useCardActions(state, {target, card}) {
    if (!card.actions) return state

    let nextState = state

    card.actions.forEach((action) => {
        // Skip invalid conditions
        if (action.conditions && !conditionsAreValid(state, action.conditions)) {
            return
        }

        // Ensure action has target info, it also overwrites any target info one is trying to give an action
        if (!action.parameter) action.parameter = {}
        //this is soley so I can reset the target parameter of the actions that simulate multi attacks back to null,
        //so that they aren't forever set to the first target you used it oneven though that was supposedly fixed
        let storedTarget = action.parameter?.target
        let storedAmountDmg = action.parameter?.amount
        //this should make it so that if target info already exists, it won't overwrite anything, but if the target property doesn't exist it will add it
        if(!action.parameter.target) {
            storedTarget = null
            action.parameter.target = target
        }
        //this should allow additional hits to respect both strengths and weak as removeHealth already respects vulnerable
        if(action.parameter.target !== 'player' && action.type === 'removeHealth')
        {
            if(nextState.player.powers?.strength)
            {
                action.parameter.amount += powers.strength.use(nextState.player.powers.strength)
            }
            if (nextState.player.powers?.tempStrength) 
            {
                action.parameter.amount += powers.tempStrength.use(nextState.player.powers.tempStrength)
            }
            if(nextState.player.powers?.weak)
            {
                action.parameter.amount = powers.weak.use(action.parameter.amount)
            }
        }
        /**
         * better to implement any waiting here as each function run should be "different" so they shouldn't interfere with other cards
         * However some interference could still occur but should be easier to handle here or like sort itself out
         */

        /* const waitProm = new Promise((resolve,reject) =>{

        }) */
        // Execute the action
        console.log(`From useCardActions\nActions:`, action)
        console.log('From useCardActions card: ',card)
        nextState = allActions[action.type](nextState, {...action.parameter, card})
        //this is just to make sure I don't accidently set some actions target to null that I didn't mean to 
        if(!storedTarget)
        {
            action.parameter.target = storedTarget
        }
        if(storedAmountDmg !== action.parameter.amount)
        {
            action.parameter.amount = storedAmountDmg
        }
    })

    return nextState
}

/**
 * Heals a target
 * Respects maximum health limits
 * @type {ActionFn<{target: string, amount: number}>}
 */
function addHealth(state, {target, amount}) {
    return produce(state, (draft) => {
        const targets = getRoomTargets(draft, target)
        targets.forEach((t) => {
            t.currentHealth = clamp(t.currentHealth + amount, 0, t.maxHealth)
        })
    })
}

/**
 * Grants regeneration based on potential damage
 * Used for certain card effects
 * @type {ActionFn<{card: CARD}>}
 */
function addRegenEqualToAllDamage(state, {card}) {
    if (!card) throw new Error('missing card!')
    return produce(state, (draft) => {
        const room = getCurrRoom(state)
        const aliveMonsters = room.monsters.filter((monster) => monster.currentHealth > 0)
        const {regen = 0} = state.player.powers
        const totalDamage = aliveMonsters.length * card.damage
        draft.player.powers.regen = totalDamage + regen
    })
}

/**
 * Removes debuff status effects from player
 * Specifically targets weak and vulnerable
 * @type {ActionFn<{}>}
 */
const removePlayerDebuffs = (state) => {
    return produce(state, (draft) => {
        draft.player.powers.weak = 0
        draft.player.powers.vulnerable = 0
    })
}

/**
 * Adds energy to player's pool
 * Used by certain cards and effects
 * @type {ActionFn<{amount?: number}>}
 */
function addEnergyToPlayer(state, props) {
    const amount = props?.amount ? props.amount : 1
    return produce(state, (draft) => {
        draft.player.currentEnergy = draft.player.currentEnergy + amount
    })
}

/**
 * Core damage dealing function
 * Handles vulnerability and block calculations
 * @type {ActionFn<{target: string, amount: number}>}
 */
const removeHealth = (state, {target, amount = 0}) => {
    return produce(state, (draft) => {
        getRoomTargets(draft, target).forEach((t) => {
            // Apply vulnerability multiplier
            if (t.powers.vulnerable) amount = powers.vulnerable.use(amount)
            
            // Calculate damage after block
            let amountAfterBlock = t.block - amount
            if (amountAfterBlock < 0) {
                t.block = 0
                t.currentHealth = t.currentHealth + amountAfterBlock
            } else {
                t.block = amountAfterBlock
            }

            // Check for player death
            if (target === 'player' && t.currentHealth < 1) {
                draft.endedAt = new Date().getTime()
            }
        })
    })
}


/**
 * Sets health of target to specific value
 * Bypasses normal damage calculation
 * @type {ActionFn<{target: CardTargets, amount: number}>}
 */
const setHealth = (state, {target, amount}) => {
    return produce(state, (draft) => {
        getRoomTargets(draft, target).forEach((t) => {
            t.currentHealth = amount
        })
    })
}

/**
 * Applies power effects from cards
 * Handles different targeting scenarios
 * @type {ActionFn<{card: CARD, target: CardTargets}>}
 */
function applyCardPowers(state, {card, target}) {
    return produce(state, (draft) => {
        Object.entries(card.powers).forEach(([name, stacks]) => {
            // Player-targeted powers
            if (card.target === CardTargets.player) {
                console.log('From applyCardPowers\nName: %s\nAmount on player: %d\nStacks being added: %d',name,draft.player.powers?.[name],stacks)
                draft.player.powers[name] = (draft.player.powers[name] || 0) + stacks
            }
            // All-enemy powers
            else if (card.target === CardTargets.allEnemies) {
                draft.dungeon.graph[draft.dungeon.y][draft.dungeon.x].room.monsters.forEach((monster) => {
                    // Skip dead monsters
                    if (monster.currentHealth < 1) return
                    monster.powers[name] = (monster.powers[name] || 0) + stacks
                })
            }
            // Single enemy target
            else if (target) {
                const index = target.split('enemy')[1]
                const monster = draft.dungeon.graph[draft.dungeon.y][draft.dungeon.x].room.monsters[index]
                if (monster.currentHealth < 1) return
                monster.powers[name] = (monster.powers[name] || 0) + stacks
            }
        })
    })
}

/**
 * Helper function to decrease power stacks
 * Used at end of turn to reduce duration of effects
 * @param {CardPowers} powersP - Collection of powers to decrease
 */
function _decreasePowers(powersP) {
    Object.entries(powersP).forEach(([name, stacks]) => {
        if (stacks > 0 && powers[name].duration === 'turn')
            {
                powersP[name] = stacks - 1
            } 
    })
}

/**
 * Reduces player's power stack counts
 * Called at end of turn
 * @type {ActionFn<{}>}
 */
function decreasePlayerPowerStacks(state) {
    return produce(state, (draft) => {
        _decreasePowers(draft.player.powers)
    })
}

/**
 * This decreases 1 power the player has by 1 stack
 * used for things that have the counter duration
 * @type {ActionFn<{pName: String}>}
 */
function decreasePowerC(state, pName)
{
    //console.log('Testing if this returns null: ' + state.player.powers[pName])
    return produce(state, (draft) => {
        if(draft.player.powers[pName])
        {
            draft.player.powers[pName] = draft.player.powers[pName] - 1
        }
    })
}

/**
 * A helper function to remove temp powers stacks however it can be used to remove powers that only last for 1 turn, makes me think I might need to double up power descriptions
 * I need to make this so it trigger if the duration includes the string temp so I can double up on duration descriptions because thats probably the best way to do this
 * @param {CardPowers} powersP - Collection of powers to decrease, named distinctly so the powers imported from powers could also be accessed
 */
function _decreasePowersT(powersP) {
    Object.entries(powersP).forEach(([name, stacks]) => {
        if(powers[name].duration === 'temp' && stacks > 0)
        {
            powersP[name] = 0
        }
    })
}

/**
 * This function should call on a helper function to decrease any powers that only last per a single turn
 * Used at the end of the turn or techincally before the next turn starts but after the monster has acted
 * @type {ActionFn<{}>}
 */
function decreasePlayerPowerStacksT(state) {
    return produce(state, (draft) => {
        _decreasePowersT(draft.player.powers)
    })
}

/**
 * Reduces monster power stack counts
 * Called at end of turn
 * @type {ActionFn<{}>}
 */
function decreaseMonsterPowerStacks(state) {
    return produce(state, (draft) => {
        getCurrRoom(draft).monsters.forEach((monster) => {
            _decreasePowers(monster.powers)
        })
    })
}

/**
 * Comprehensive end-of-turn processing
 * Handles discard, regeneration, monster actions, and status updates
 * Also checks for game over conditions
 * @type {ActionFn<{}>}
 */
function endTurn(state) {
    // Start by discarding hand
    let newState = discardHand(state)

    // Process regeneration if player has it
    if (state.player.powers.regen) {
        newState = produce(newState, (draft) => {
            let amount = powers.regen.use(newState.player.powers.regen)
            let newHealth
            // Cap healing at max health
            if (newState.player.currentHealth + amount > newState.player.maxHealth) {
                newHealth = newState.player.maxHealth
            } else {
                newHealth = addHealth(newState, {target: 'player', amount}).player.currentHealth
            }
            draft.player.currentHealth = newHealth
        })
    }
    if(state.player.powers?.energized)
    {
        newState = produce(newState, (draft) =>
        {
            draft.player.nextTurn.energy = powers.energized.use(newState)
        })
    }
    if(state.player.powers?.cultivation)
    {
        newState = produce(newState, (draft) => {
            draft.player.nextTurn.maxEnergy = powers.cultivation.use(newState)
        })
    }


    // Run monster turns and decrease power stacks
    newState = playMonsterActions(newState)
    newState = decreasePlayerPowerStacksT(newState)
    newState = decreasePlayerPowerStacks(newState)
    newState = decreaseMonsterPowerStacks(newState)

    // Check for game over conditions
    const isDead = newState.player.currentHealth < 0
    const didWin = isDungeonCompleted(newState)
    const gameOver = isDead || didWin

    // Update game state if game is over
    newState = produce(newState, (draft) => {
        if (didWin) draft.won = true
        if (gameOver) {
            draft.endedAt = new Date().getTime()
        }
    })

    // Start new turn if game isn't over
    if (!gameOver) newState = newTurn(newState)
    return newState
}

/**
 * Initializes a new turn
 * Draws cards, resets energy and block
 * @type {ActionFn<{}>}
 */
function newTurn(state) {
    let draw = 5 + state.player.nextTurn.drawAmt
    const newState = drawCards(state,{amount: draw})

    return produce(newState, (draft) => {
        draft.turn++
        draft.player.maxEnergyC = draft.player.maxEnergy + draft.player.nextTurn.maxEnergy
        draft.player.currentEnergy = draft.player.maxEnergyC + draft.player.nextTurn.energy //this should hopefully allow for +x energy at the start of next turn to work
        draft.player.block = 0 + draft.player.nextTurn.block
        draft.player.nextTurn.energy = 0
        draft.player.nextTurn.block = 0
        draft.player.nextTurn.drawAmt = 0
        draft.player.nextTurn.maxEnergy = 0
    })
}

/**
 * Ends current encounter/combat
 * Resets various combat-specific states
 * @type {ActionFn<{}>}
 */
function endEncounter(state) {
    const nextState = produce(state, (draft) => {
        // Clear all card piles except main deck
        draft.hand = []
        draft.discardPile = []
        draft.exhaustPile = []
        // Reshuffle deck into draw pile
        draft.drawPile = shuffle(draft.deck)
    })
    return drawCards(nextState)
}

/**
 * Executes all monster actions in current room
 * Processes each monster's intent in sequence
 * @type {ActionFn<{}>}
 */
function playMonsterActions(state) {
    const room = getCurrRoom(state)
    if (!room.monsters) return state
    
    let nextState = state
    room.monsters.forEach((monster, index) => {
        if(monster.powers.poison)
        {
            let targetP = 'enemy' + `${index}`
            nextState = setHealth(nextState,{target: targetP,amount: monster.currentHealth - powers.poison.use(monster.powers.poison)})
            //nextState = decreaseMonsterPowerC(nextState, {pName: 'poison',monster: room.monsters[index]}) wont need to do this since as long as poison damage is dealt before the monsters turn its all good

        }
        nextState = takeMonsterTurn(nextState, index)
    })
    return nextState
}

/**
 * Processes a single monster's turn
 * Executes the monster's current intent
 * @type {ActionFn<number>}
 */
function takeMonsterTurn(state, monsterIndex) {
    return produce(state, (draft) => {
        const room = getCurrRoom(draft)
        const monster = room.monsters[monsterIndex]
        
        // Reset block at turn start
        monster.block = 0
        
        // Skip if monster is dead
        if (monster.currentHealth < 1) return

        // Get and validate current intent
        const intent = monster.intents[monster.nextIntent || 0]
        if (!intent) return

        // Update intent for next turn
        if (monster.nextIntent === monster.intents.length - 1) {
            monster.nextIntent = 0
        } else {
            monster.nextIntent++
        }

        // Process intent effects
        // Apply block
        if (intent.block) {
            monster.block = monster.block + intent.block
        }

        // Deal damage
        if (intent.damage) {
            let amount = intent.damage
            if (monster.powers.weak) amount = powers.weak.use(amount)
            const updatedPlayer = removeHealth(draft, {target: 'player', amount}).player
            draft.player.block = updatedPlayer.block
            draft.player.currentHealth = updatedPlayer.currentHealth
            if (updatedPlayer.currentHealth < 1) {
                draft.endedAt = new Date().getTime()
            }
        }

        // Apply vulnerable
        if (intent.vulnerable) {
            draft.player.powers.vulnerable = (draft.player.powers.vulnerable || 0) + intent.vulnerable + 1
        }

        // Apply weak
        if (intent.weak) {
            draft.player.powers.weak = (draft.player.powers.weak || 0) + intent.weak + 1
        }
    })
}

/**
 * Adds a new card to player's deck
 * Used for card rewards and events
 * @type {ActionFn<{card: CARD}>}
 */
function addCardToDeck(state, {card}) {
    return produce(state, (draft) => {
        draft.deck.push(card)
    })
}

/**
 * Updates player position in dungeon
 * Handles room transitions and state resets
 * @type {ActionFn<{move: {x: number, y: number}}>}
 */
function move(state, {move}) {
    let nextState = endEncounter(state)

    return produce(nextState, (draft) => {
        // Reset combat-specific states
        draft.player.powers = {}
        draft.player.currentEnergy = draft.player.maxEnergy
        draft.player.block = 0
        draft.player.nextTurn.energy = 0
        draft.player.nextTurn.block = 0
        draft.player.nextTurn.drawAmt = 0
        
        // Update dungeon position and history
        draft.dungeon.graph[move.y][move.x].didVisit = true
        draft.dungeon.pathTaken.push([move.x, move.y])
        draft.dungeon.x = move.x
        draft.dungeon.y = move.y
    })
}

/**
 * Deals damage based on player's block
 * Used by certain card effects
 * @type {ActionFn<{target: CardTargets}>}
 */
function dealDamageEqualToBlock(state, {target}) {
    if (state.player.block) {
        const block = state.player.block
        return removeHealth(state, {target, amount: block})
    }
}

/**
 * Deals damage based on target's vulnerable stacks
 * Special card effect
 * @type {ActionFn<{target: CardTargets}>}
 */
function dealDamageEqualToVulnerable(state, {target}) {
    return produce(state, (draft) => {
        getRoomTargets(draft, target).forEach((t) => {
            if (t.powers.vulnerable) {
                const amount = t.currentHealth - t.powers.vulnerable
                t.currentHealth = amount
            }
        })
        return draft
    })
}

/**
 * Deals damage based on target's weak stacks
 * Special card effect
 * @type {ActionFn<{target: CardTargets}>}
 */
function dealDamageEqualToWeak(state, {target}) {
    return produce(state, (draft) => {
        getRoomTargets(draft, target).forEach((t) => {
            if (t.powers.weak) {
                const amount = t.currentHealth - t.powers.weak
                t.currentHealth = amount
            }
        })
        return draft
    })
}

/**
 * Applies a power to a target
 * Used for direct power application effects
 * @type {ActionFn<{target: CardTargets, power: string, amount: number}>}
 */
function setPower(state, {target, power, amount}) {
    return produce(state, (draft) => {
        getRoomTargets(draft, target).forEach((target) => {
            target.powers[power] = amount
        })
    })
}

/**
 * Records player choice at campfire
 * Used for statistics and achievements
 * @type {ActionFn<{room: Room, choice: string, reward: CARD}>}
 */
function makeCampfireChoice(state, {choice, reward}) {
    return produce(state, (draft) => {
        const room = getCurrRoom(draft)
        room.choice = choice
        room.reward = reward
    })
}

/**
 * Debug/cheat function
 * Sets all monster health to 1
 * Named after DOOM's god mode cheat code
 * @type {ActionFn<{}>}
 */
function iddqd(state) {
    console.log('iddqd')
    return produce(state, (draft) => {
        draft.dungeon.graph.forEach((floor) => {
            floor.forEach((node) => {
                if (!node.room || !node.room.monsters) return
                node.room.monsters.forEach((monster) => {
                    monster.currentHealth = 1
                })
            })
        })
    })
}

// Export all action functions as a single object
const allActions = {
    addCardToDeck,
    addCardToHand,
    addEnergyToPlayer,
    addHealth,
    addRegenEqualToAllDamage,
    addStarterDeck,
    applyCardPowers,
    createNewState,
    dealDamageEqualToBlock,
    dealDamageEqualToVulnerable,
    dealDamageEqualToWeak,
    discardCard,
    discardHand,
    drawCards,
    endTurn,
    iddqd,
    makeCampfireChoice,
    move,
    playCard,
    removeCard,
    removeHealth,
    removePlayerDebuffs,
    setDungeon,
    setHealth,
    setPower,
    takeMonsterTurn,
    upgradeCard,
    endEncounter,
    _addCardToHand,
    addCardToHandRand,
}

export default allActions
