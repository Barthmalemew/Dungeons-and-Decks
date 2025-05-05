export default{
    name: "Arcane Cultivation", //this is what create card will uses to find the card indicated by the string given to it
    cardColor: "Purple", //can be Red, Green, Purple, Curse, Colorless
    type: "power", //can be attack, skill, power, status or curse
    description: "Channel magical energy to get +1 max energy for the rest of combat",
    //image: "usually the name of the card as the image file is named [cardName].png",
    energy: 2, //normally a Number
    target: "player", //can be player, enemy, allEnemies
    cardRarity: "Rare", // can be Basic, Special, Curse, Common
    exhaust: true, //a boolean that dictates whether a card should exhaust when played
    //upgraded this isnt a thing set in cards but rather something createCard adds
    powers: {
        cultivation: 1, //add your powers here, using the name of the power and then a : and then the number of stacks you want to apply
    },

}

export const upgrade = (card) => {
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        energy: 1,
        powers: {
            cultivation: 1, //add your powers here, using the name of the power and then a : and then the number of stacks you want to apply
        },
    }
}