export default{
    name: "Skill Spell Slot lv:1", //this is what create card will uses to find the card indicated by the string given to it
    cardColor: "Purple", //can be Red, Green, Purple, Curse, Colorless
    type: "skill", //can be attack, skill, power, status or curse
    description: "Creates 1 of 3 level 1 skill spells",
    //image: "usually the name of the card as the image file is named [cardName].png",
    energy: 1, //normally a Number
    target: "player", //can be player, enemy, allEnemies
    cardRarity: "Common", // can be Basic, Special, Curse, Common
    actions: [
        {
            type: 'addCardToHandRand', //the name of the action goes here
            parameter: {
                cardN1: 'Arcane Boost',
                cardN2: 'Poison Spray',
                cardN3: 'Healing Word',
            },
        },
    ],
    

}

export const upgrade = (card) => {
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        actions: [
            {
                type: 'addCardToHandRand', //the name of the action goes here
                parameter: {
                    cardN1: 'Arcane Boost',
                    cardN2: 'Poison Spray',
                    cardN3: 'Healing Word',
                    shouldUpgrade: true,
                },
            },
        ],
    }
}