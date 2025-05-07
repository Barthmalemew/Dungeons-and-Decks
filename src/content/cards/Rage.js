export default{
    name: "Rage", //this is what create card will uses to find the card indicated by the string given to it
    cardColor: "Red", //can be Red, Green, Purple, Curse, Colorless
    type: "attack", //can be attack, skill, power, status or curse
    description: "Deal 6 damage. Add 1 Rage to your deck.",
    image: "Rage.png",
    energy: 0, //normally a Number
    damage: 6, //also normally a number
    target: "enemy", //can be player, enemy, allEnemies
    cardRarity: "Rare", // can be Basic, Special, Curse, Common
    //upgraded this isnt a thing set in cards but rather something createCard adds
    actions: [
        {
            type: 'addCardToDeck', //the name of the action goes here
            parameter: {
                card: 'Rage', //any parameters to be passed to the action go here
            },
        },
    ],
}

export const upgrade = (card) => {
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        description: "Deal 8 damage. Add 1 Rage to your deck.",
        damage: 8, //add your changed values here
        //when wanting to have the upgraded version of a card have different values for the parameters of the card action it has, just rewrite the actions property here
        //and changes the values as trying to do it the way that stw does it causes the change that should only affect the upgraded version alter the base verison as well
    }
}