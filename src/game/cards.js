
//need to import the function to give the cards each a unique Id
import {uuid} from '../utils.js'
import {cards, cardUpgrades} from '../content/cards.js'
//need to import the functions that provide the actual cards and their upgrades from the cards file in the content folder

/** @enum {String}  */
export const CardTypes = {
    attack: 'attack',
    skill: 'skill',
    power: 'power',
    status: 'status',
    curse: 'curse',
}

/**@enum {String} - This value must either be "player", "enemyx" where x is the index of the enemy being targeted, or "allEnemies" */
export const CardTargets = {
    player: 'player',
    enemy: 'enemy',
    allEnemies: 'allEnemies',
}

/** @enum {String} - This color value will be used to sort the card rewards based on the color associated with the class */
export const Color = {
    Red: 'Red', //Fighter
    Purple: 'Purple', //Mage
    Green: 'Green', //Rouge
    Colorless: 'Colorless', //for status and the cards for the spells themself, also to allow for easier sorting for cards
    Curse: 'Curse', //For easier sorting for curse cards
}

/** @enum {String} - This is the rarity values corresponding to a card, currently only used for sorting purposes and will be designated as a optional parameter */
export const Rarity = {
    Basic: 'Basic', //for the Strike's and Defend's of each class
    Special: 'Special', //for cards that can only be obtained from other cards or events, such as the spell cards generated from the wizards spell slot cards
    Curse: 'Curse', //curses 
    Common: 'Common', //just a rank for any cards that don't fall into the other categories
    Uncommon: 'Uncommon', //idk what we will use these later rarities for outside of maybe adding weights in the random card selection
    Rare: 'Rare',
}

/**
 * @typedef {Object} CardPowers
 * @prop {Number=} regen
 * @prop {Number=} weak
 * @prop {Number=} vulnerable
 * @prop {Number=} strength
 * @prop {Number=} dexterity
 */

/**
 * @typedef {Object} CardAction - Allows for a card to define and run a set of actions
 * @prop {String} type - The name of the action to call
 * @prop {Object} [parameter] - The props to be passed to the action
 * @prop {Array<{type: String}>} [conditions] - a list of conditions for the action to execute
 */

/**
 * @typedef CARD
 * @prop {String=} id 
 * @prop {String} name
 * @prop {String} description
 * @prop {String} image
 * @prop {Number} energy
 * @prop {CardTypes} type - Specifies the card type
 * @prop {Number} [damage] - The amount of damage a card does to its target
 * @prop {Number} [block] - The amount of block a card applies to its target
 * @prop {CardTargets} target - The special string used to specify the target of a card
 * @prop {Color} cardColor - This specifies the class this card is tied to in order to make sure a player only recieves cards for the class/classes they have at the end of the battle
 * @prop {Rarity=} cardRarity - This designates a cards 'rarity' currently it is only used to make filtering out cards easier
 * @prop {Boolean=} exhaust - This specifies whether the card will exhaust when played or not
 * @prop {Boolean=} ethereal - This specifies whether the card will exhaust when discarded
 * @prop {Boolean=} upgraded
 * @prop {CardPowers} [powers] - These are the powers the card can apply
 * @prop {Array<CardAction>} [actions] - an optional list of defined actions a card can execute when played that will run in a defined order
 * @prop {Array<{type: String}>} [conditions] - an optinally defined set of conditions that need to hold true for the card to be playable or for the actions to run 
 */

export class Card {
    /** @param {CARD} props */
    constructor(props)
    {
        this.id = uuid();
        this.name = props.name;
        this.description = props.description;
        this.image = props.image;
        this.energy = props.energy;
        this.type = CardTypes[props.type];
        this.damage = props.damage || 0;
        this.block = props.block || 0;
        this.target = CardTargets[props.target];
        this.cardColor = Color[props.cardColor];
        this.cardRarity = Rarity[props.cardRarity] || Rarity.Common;
        this.exhaust = props.exhaust || false;
        this.ethereal = props.ethereal || false;
        this.upgraded = props.upgraded || false;
        this.powers = props.powers;
        this.actions = props.actions;
        this.conditions = props.conditions;
    }
}

/**
 * Turns a object based card into a class based one
 * @param {String} name 
 * @param {boolean} [shouldUpgrade]
 * @returns {CARD}  the newly created card
 */
export function createCard(name, shouldUpgrade)
{
    //this checks if a card is the upgraded version of itself
    if(name.includes('+'))
    {
        console.log('shouldUpgrade triggered')
        //runs the createCard function with the should upgrade as true to create the upgraded
        return createCard(upgradeNameMap[name], true);
    }
    //this finds the card from the card array and sets that object to the card variable
    //console.log(`card.name: ${card.name}`)
    console.log(`From createCard name: ${name}`)
    let card = cards.find((card) => card.name === name);
    console.log('From createCard\nAnother log of the created card: ',card)
    if(!card) throw new Error(`Could not find card: ${name}`)
    //this checks if a card should be upgraded
    if(shouldUpgrade)
    {
        const upgradeFn = cardUpgrades[name];
        card = upgradeFn(card)
        card.upgraded = true;
        if(!card.name.includes('+')) card.name+='+'
    }
    else{
        //clones the card
        card = {...card};
    }
    return new Card(card);
}
//creates the upgrade map for names
const upgradeNameMap = {}

cards.forEach((card) => {
    const upgradeFn = cardUpgrades[card.name];
    if(upgradeFn)
    {
        const upgradedCard = upgradeFn(card);
        if(upgradedCard.name !== card.name + '+')
        {
            upgradeNameMap[upgradedCard.name] = card.name;
        }
    }
})


/**
 * This pulls a random amount of cards from a card array given
 * @param {Array} list The collection of cards for the function to pick from
 * @param {Number} amount the amount of cards randomly chosen from the list given you wish to recieve
 * @returns {Array} an array with length amount filled with randomly picked cards from the list array
 */
export function getRandomCards(list, amount)
{
    //creates an array of cards names to pull from as we need card objects to turn into class based versions of themselves
    const cardNames = list.map((card) => card.name)
    let results = [];
    for(let i = 0; i < amount; i++)
    {
        const randomIndex = Math.floor(Math.random() * cardNames.length)
        const name = cardNames[randomIndex]
        const card = createCard(name);
        results.push(card);
    }
    return results;
}

/**
 * This function gets an array size amount filled with random cards after filtering out basic, curse, special, and status cards along with cards that don't belong to the class(es) assigned to the player that point in the run
 * @param {import('../game/actions.js').State} gameState 
 * @param {Number=} [amount=3] - Number of card to reward
 * @returns {Array} rewards
 */
export function getCardRewards(gameState, amount=3)
{
    //remove strike defend and curses from the reward, this will also need to be rewritten as situations like certain colorless cards not being able to be obtained outside of events or being created by other cards will exist
    const niceCards = cards.filter((card) => card.cardRarity !== Rarity.Basic).filter((card) => card.cardRarity !== Rarity.Special).filter((card) => card.type !== CardTypes.status).filter((card) => card.type !== CardTypes.curse);
    //need to find a way to check the player's class and ideally filter out the cards that don't match the classes assigned to them as eventually there are plans
    //to have a relic or alternate game option allow one to pick up cards from other classes, I am making the gamestate a parameter of the function to facilitate this
    let rewardCards = niceCards;
    if(gameState.character)
    {
        //for the class filtering, key = the name of a class, and value is a bool that designates true if a class is assigned and false if it isn't, other classes can be assigned from relics that allow cards from all classes to be picked up
        for (let [key, value] of Object.entries(gameState.character)) {
            //if a class is not assiged true the body of this if statement will run filtering those cards out of the pool
            if (!value) {
                //this Color[cClass] might need to be Color[`${cClass}`]
                //the easiest way to do this is to find which classes aren't assigned and then filter out the array such that all of the cards in the pool dont have the class tag that was false
                //this is because there is no real good way to write this check in a way that always takes the shorter route
                //as such it makes more sense to filter out unwanted classes one by one instead of filtering for wanted as it feels easier to manage since im not repeatedly adding to a pile but witling one down
                rewardCards = rewardCards.filter((card) => card.cardColor !== Color[key]);
            }
        }
    }
    
    //this is the array that actually holds the cards
    const rewards = [];
    //just makes sure that the amount of cards rewards generated is true to the amount wanted 
    while(rewards.length < amount)
    {
        //uses the getRandomCards function and the newly trimmed rewardCards array to pull a single random card
        const card = getRandomCards(rewardCards, 1)[0];
        //this is for checking if the card pulled was a duplicate, can probably improve this by filtering out the card name and upgrade from the pool once piced since 
        //rewardCards is no longer a constant array however not having as a constant array might cause issues
        const isDuplicate = Boolean(rewards.find((c) => c.name === card.name));
        //if the card isnt a duplicate push it into the rewards array
        if(!isDuplicate)
        {
            rewards.push(card);
        }
    }
    return rewards;
}