export default{
    name: "ShatterSplash",
    cardColor: "Colorless", //can be Red, Green, Purple, Curse, Colorless
    type: "attack", //can be attack, skill, power, status or curse
    description: "Attacks one enemy and does splash damage to all enemies",
    //image: "usually the name of the card as the image file is named [cardName].png",
    energy: 0, //normally a Number
    damage: 3, //also normally a number
    target: "allEnemies", //can be player, enemy, allEnemies
    cardRarity: "Special", // can be Basic, Special, Curse, Common
    exhaust: true, //a boolean that dictates whether a card should exhaust when played
    ethereal: true, //a boolean that dictates whether a card should exhaust when discarded
    //upgraded this isnt a thing set in cards but rather 
}