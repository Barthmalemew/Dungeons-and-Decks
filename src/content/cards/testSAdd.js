export default{
    name: "Card Adder",
    cardColor: "Colorless", //can be Red, Green, Purple, Curse, Colorless
    type: "curse", //can be attack, skill, power, status or curse
    description: "A Test card that tests the adding card to hand function overload",
    //image: "usually the name of the card as the image file is named [cardName].png",
    energy: 1, //normally a Number
    target: "player", //can be player, enemy, allEnemies
    cardRarity: "Basic", // can be Basic, Special, Curse, Common
    exhaust: false, //a boolean that dictates whether a card should exhaust when played
    ethereal: false, //a boolean that dictates whether a card should exhaust when discarded
    //upgraded this isnt a thing set in cards but rather 
    actions: [
        {
            type: '_addCardToHand', //the name of the action goes here
            parameter: {
                cardName: 'Magic Missile', //any parameters to be passed to the action go here
            },
        },
        {
            type: '_addCardToHand',
            parameter: {
                cardName: 'Firebolt',
            },
        },
        {
            type: '_addCardToHand',
            parameter: {
                cardName: 'Shatter',
            },
        },
    ],

}

export const upgrade = (card) => {
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        actions: [
            {
                type: '_addCardToHand', //the name of the action goes here
                parameter: {
                    cardName: 'Magic Missile+', //any parameters to be passed to the action go here
                },
            },
            {
                type: '_addCardToHand',
                parameter: {
                    cardName: 'Firebolt+',
                },
            },
            {
                type: '_addCardToHand',
                parameter: {
                    cardName: 'Shatter+',
                },
            },
        ],
    }
}