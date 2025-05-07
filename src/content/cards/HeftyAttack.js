export default{
    name: "HeftyAttack", //this is what create card will uses to find the card indicated by the string given to it
    cardColor: "Red", //can be Red, Green, Purple, Curse, Colorless
    type: "attack", //can be attack, skill, power, status or curse
    description: "Use all your might to deal 10 damage.",
    image: "HeftyAttack.png",
    energy: 2, //normally a Number
    damage: 10, //also normally a number
    target: "enemy", //can be player, enemy, allEnemies
    cardRarity: "Rare", // can be Basic, Special, Curse, Common

}

export const upgrade = (card) => {
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        description: "Use all your might to deal 15 damage.",
        damage: 15, //add your changed values here
        //when wanting to have the upgraded version of a card have different values for the parameters of the card action it has, just rewrite the actions property here
        //and changes the values as trying to do it the way that stw does it causes the change that should only affect the upgraded version alter the base verison as well
    }
}