/**
 * Structure of the powers
 * @typedef POWER
 * @prop{String} name, the name of the power, this will show when it is hovered over
 * @prop{String} description: A description of the powers effects, also shown when hovered over
 * @prop{String} type: the type of effect this power is, buff or debuff
 * @prop{String} duration describes how long a power stack is supposed to last: combat lasts the entire combat, turn has 1 stack last per 1 turn, counter lasts one stack per action that triggers the effect, and temp lasts 1 turn only
 * @prop{String=} target: The target of this power or who this can be applied to, when this field is blank it means this power can be applied to both the player and the enemy
 * @prop{Function=} use: The parameter and return value of the use function.
 */

/**
 * Stacks are a value that determines the duration or level of powers
 * however they are not actually a part of the Power class and instead are a part of the powers object or the cardPowers object
 *  used in the player/monster object or the card object respectively
 * the player/monster powers object intitally starts with no properties, but makes use of the ability for js objects to have properties added to them after creation
 * this added properties are stored as name: stacks where name is the POWER object and stacks is a number representing the stacks
 * this allows for a way to imitate a data structure like maps or sets without having to use one as object properties have to have unique keys.
 */

//Power class
class Power{

    /**
     * 
     * @param {POWER} power - The base to create a class from 
     */
    constructor(power) {
        const{name, description, duration,type,target,use} = power
        this.name = name
        this.description = description
        this.duration = duration
        this.type = type
        this.target = target
        this.use = use
    }
}

export const regen = new Power({
    type: 'buff',
    name: 'regen',
    description: 'Heals health equivalent to the amount of regen stacks per turn',
    duration: 'turn',
    target: 'player',
    use: (stacks) => stacks,
})

export const vulnerable = new Power({
    type: 'debuff',
    name:'vulnerable',
    description: 'Makes afflicted entity take 50% more damage while vulnerable',
    duration:'turn',
    use: (dmg) => Math.floor(dmg * 1.5),
})

export const strength = new Power({
    type: 'buff',
    name: 'Strength',
    description: 'Entities strengthened deal +${stacks} extra damage',
    duration: 'combat',
    use: (stacks) => stacks,
})

export const tempStrength = new Power({
    type: 'buff',
    name: 'Temporary Strength',
    description: 'Attacks deal +${stacks} extra damage this turn',
    duration: 'temp',
    use: (stacks) => stacks,

})

export const dexterity = new Power({
    type: 'buff',
    name: 'Dexterity',
    description: 'Grants ${stacks} extra block',
    duration: 'combat',
    target: 'player',
    use: (stacks) => stacks,
})

export const weak = new Power({
    type: 'debuff',
    name: 'Weaken',
    description: 'Afflicted entity deals 25% less damage',
    duration: 'turn',
    use: (dmg) => Math.floor(dmg * 0.75),
})

export const frail = new Power({
    type: 'debuff',
    name: 'Frail',
    description: 'Blocking becomes 25% less effective',
    duration: 'turn',
    target: 'player',
    use: (block) => Math.floor(block * 0.75),
})

export const dblAttack = new Power({
    type: 'buff',
    name: 'True strike',
    description: 'Attacks are played ${amount} times',
    duration: 'counter',
    target: 'player',
    use: (stacks) => stacks,
})

export const poison = new Power({
    type: 'debuff',
    name: 'Poison',
    description: 'Deals ${stacks} damage to afflicted enemy at the start of their turn',
    duration: 'turn',
    use: (stacks) => stacks,
})

export const energized = new Power({
    type: 'buff',
    name:'Energized',
    description:'Gain ${stacks} of energy next turn',
    duration: 'temp',
    target: 'player',
    use: (state) => state.player.powers.energized,
})

export default {regen, weak, vulnerable, strength, dexterity, frail, dblAttack,tempStrength, poison, energized}