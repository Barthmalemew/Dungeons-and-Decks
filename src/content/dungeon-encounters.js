import {Monster} from '../game/monster.js'

export const demoMonster = new Monster({
    currentHealth: 30, 
    maxHealth: 30, 
    intents: [{damage: 7}], 
    random: 3, 
    shuffleIntentOrder: false})