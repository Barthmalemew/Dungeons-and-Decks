export default{
    name: "placeholder", //this is what create card will uses to find the card indicated by the string given to it
    cardColor: "Colorless", //can be Red, Green, Purple, Curse, Colorless
    type: "curse", //can be attack, skill, power, status or curse
    description: "this is a cards description",
    image: "usually the name of the card as the image file is named [cardName].png",
    energy: 0, //normally a Number
    damage: 100, //also normally a number
    target: "player", //can be player, enemy, allEnemies
    cardRarity: "Basic", // can be Basic, Special, Curse, Common
    block: 1000, //a number
    exhaust: true, //a boolean that dictates whether a card should exhaust when played
    ethereal: true, //a boolean that dictates whether a card should exhaust when discarded
    //upgraded this isnt a thing set in cards but rather something createCard adds
    powers: {
        strenght: 100, //add your powers here, using the name of the power and then a : and then the number of stacks you want to apply
    },
    actions: [
        {
            type: 'drawCards', //the name of the action goes here
            parameter: {
                amount: 100, //any parameters to be passed to the action go here
            },
        },
        {
            type: 'addEnergyToPlayer',
            parameter: {
                amount: 100,
            },
        },
    ],
    /* conditions: [
        {
            type: 'onlyAttack', //the condition goes here
            cardType: 'attack', //the parameters for the condition goes here
        },
    ], */

}

export const upgrade = (card) => {
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        damage: 0, //add your changed values here
        //when wanting to have the upgraded version of a card have different values for the parameters of the card action it has, just rewrite the actions property here
        //and changes the values as trying to do it the way that stw does it causes the change that should only affect the upgraded version alter the base verison as well
    }
}