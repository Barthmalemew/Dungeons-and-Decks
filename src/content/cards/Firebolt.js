export default{
    name: "Firebolt",
    cardColor: "Colorless", //can be Red, Green, Purple, Curse, Colorless
    type: "attack", //can be attack, skill, power, status or curse
    description: "Shoots a bolt of fire at an enemy",
    //image: "usually the name of the card as the image file is named [cardName].png",
    energy: 0, //normally a Number
    damage: 5, //also normally a number
    target: "enemy", //can be player, enemy, allEnemies
    cardRarity: "Special", // can be Basic, Special, Curse, Common
    exhaust: true, //a boolean that dictates whether a card should exhaust when played
    ethereal: true, //a boolean that dictates whether a card should exhaust when discarded
    //upgraded this isnt a thing set in cards but rather 
    
}

export const upgrade = (card) => {
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        damage: 10, //add your changed values here
    }
}