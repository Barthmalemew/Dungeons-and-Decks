export default{
    name: "Healing Word", //this is what create card will uses to find the card indicated by the string given to it
    cardColor: "Colorless", //can be Red, Green, Purple, Curse, Colorless
    type: "skill", //can be attack, skill, power, status or curse
    description: "Heals you for 2 damage",
    //image: "usually the name of the card as the image file is named [cardName].png",
    energy: 0, //normally a Number
    target: "player", //can be player, enemy, allEnemies
    cardRarity: "Special", // can be Basic, Special, Curse, Common
    exhaust: true, //a boolean that dictates whether a card should exhaust when played
    ethereal: true, //a boolean that dictates whether a card should exhaust when discarded
    //upgraded this isnt a thing set in cards but rather something createCard adds

    actions: [
        {
            type: 'addHealth', //the name of the action goes here
            parameter: {
                amount: 2, //any parameters to be passed to the action go here
                target: 'player',
            },
        },
    ],

}

export const upgrade = (card) => {
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        description: "Heals you for 4 damage",
        actions: [
            {
                type: 'addHealth', //the name of the action goes here
                parameter: {
                    amount: 4, //any parameters to be passed to the action go here
                    target: 'player',
                },
            },
        ],
    }
}