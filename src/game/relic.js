/**
 * Structure of a Relic
 * @typedef RELIC
 * @prop{String} name, The name of the relic, will show when clicked
 * @prop{String} description, A description of the relics effects, also shown when clicked
 * @prop{String} rarity, Determines whether the relic can be found in a chest (common, uncommon, rare), if the relic is a shop exclusive, boss exclusive, or event exclusive
 * @prop{Boolean} active, Whether the relic is active or not
 * @prop{String} duration, Describes whether the relic activates at the start of combat, every turn, or has a counter
 * @prop{Number=} counter, A counter for relics that activate after a certain amount of turns
 * @prop{Function=} use, The function that will run when a relic is used
 */

class Relic{

    constructor(relic) {
        const{name,description,rarity,active,duration,counter,use} = relic
        this.name = name
        this.description = description
        this.rarity = rarity
        this.active = active
        this.duration = duration
        this.counter = counter
        this.use = use
    }
}
