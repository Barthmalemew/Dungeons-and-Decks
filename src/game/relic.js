//should probably store relics in an array in the player so I can search for relics that are not in the player's possession
//or simply remove a relic from the pool once its gathered?
//should probably structure these like cards and not powers

/**@enum {String} - This color value will be used to determine which class can use a relic, most relics are colorless */
export const Color = {
    Red: 'Red',
    Purple: 'Purple',
    Green: 'Green',
    Colorless: 'Colorless',
}

/**@enum {String} - This rarity value is used to sort the random relic rewards from chests and boss drops */
export const Rarity = {
    Common: 'Common',
    Uncommon: 'Uncommon',
    Rare: 'Rare',
    Shop: 'Shop',
    Event: 'Event',
    Boss: 'Boss',
}

/**
 * Structure of a Relic
 * @typedef RELIC
 * @prop {String} name, The name of the relic, will show when clicked
 * @prop {String} description, A description of the relics effects, also shown when clicked
 * @prop {Rarity} rarity, Determines whether the relic can be found in a chest (common, uncommon, rare), if the relic is a shop exclusive, boss exclusive, or event exclusive
 * @prop {Color=} relicColor - This specifies which class can use which relic
 * @prop {Boolean} active, Whether the relic is active or not
 * @prop {String} duration, Describes whether the relic activates at the start of combat, every turn, or has a counter
 * @prop {Number=} counter, A counter for relics that activate after a certain amount of turns
 * 
 */

class Relic{
    /**@param {RELIC} relic */
    
}

