export default{
    name: "Shield of Faith", //this is what create card will uses to find the card indicated by the string given to it
    cardColor: "Colorless", //can be Red, Green, Purple, Curse, Colorless
    type: "power", //can be attack, skill, power, status or curse
    description: "Use holy energy to grant +1 dexterity",
    //image: "usually the name of the card as the image file is named [cardName].png",
    energy: 0, //normally a Number
    target: "player", //can be player, enemy, allEnemies
    cardRarity: "Special", // can be Basic, Special, Curse, Common
    exhaust: true, //a boolean that dictates whether a card should exhaust when played
    ethereal: true, //a boolean that dictates whether a card should exhaust when discarded
    //upgraded this isnt a thing set in cards but rather something createCard adds
    powers: {
        dexterity: 1, //add your powers here, using the name of the power and then a : and then the number of stacks you want to apply
    },
}

export const upgrade = (card) => {
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        description: "Use holy energy to grant +2 dexterity",
        powers: {
            dexterity: 2, //add your powers here, using the name of the power and then a : and then the number of stacks you want to apply
        },
    }
}