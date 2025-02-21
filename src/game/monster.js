import {random, shuffle} from '../utils.js'

/**@typedef MonsterOptions 
 * @property {number} currentHealth - the current health of the monster
 * @property {number} maxHealth - the max health of the monster
 * @property {array} intents - the intents of the monster
 * @property {number} random - a range for random intents
 * @property {boolean} shuffleIntentOrder - whether or not to shuffle the order of the intents
 */

export let defaultMonsterOptions = {
    currentHealth: 30,
    maxHealth: 30,
    intents: [{damage: 7}],
    random: 3,
    shuffleIntentOrder: false
}

export class Monster
{
    constructor(props)
    {
        this.currentHealth = props.currentHealth || defaultMonsterOptions.currentHealth
        this.maxHealth = props.maxHealth || defaultMonsterOptions.maxHealth
        this.intents = props.intents || defaultMonsterOptions.intents
        this.random = props.random || defaultMonsterOptions.random
        this.shuffleIntentOrder = props.shuffleIntentOrder || defaultMonsterOptions.shuffleIntentOrder

        this.intentIndex = 0
        this.getNextIntent = this.getNextIntent.bind(this)
    }

    getNextIntent()
    {
        if (this.intentIndex >= this.intents.length) this.intentIndex = 0

        if (this.shuffleIntentOrder && this.intentsIndex === 0) shuffle(this.intents)

        let returnIntent = this.intents[this.intentIndex]
        
        if (random > 0 && returnIntent.damage)
        {
            returnIntent.damage += random(-random, random)
        }

        this.intentIndex++
        return returnIntent
    }
}