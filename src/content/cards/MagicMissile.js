export default{
    name: "Magic Missile",
    cardColor: "Colorless", //can be Red, Green, Purple, Curse, Colorless
    type: "attack", //can be attack, skill, power, status or curse
    description: "Fires 3 bolts of pure magic at an enemy dealing 2 damage each.",
    image: "MagicMissle.png",
    energy: 0, //normally a Number
    damage: 2, //also normally a number
    target: "enemy", //can be player, enemy, allEnemies
    cardRarity: "Special", // can be Basic, Special, Curse, Common
    exhaust: true, //a boolean that dictates whether a card should exhaust when played
    ethereal: true, //a boolean that dictates whether a card should exhaust when discarded
    //upgraded this isnt a thing set in cards but rather 
    actions: [
        {
            type: 'removeHealth', 
            parameter: {
                amount: 2,
                target: null,
            },
        },
        {
            type: 'removeHealth', 
            parameter: {
                amount: 2,
                target: null,
            },
        },
    ],

}

export const upgrade = (card) => {
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        damage: 3, //add your changed values here
        description: "Fires 3 bolts of pure magic at an enemy dealing 3 damage each.",
        actions: [
            {
                type: 'removeHealth', 
                parameter: {
                    amount: 3,
                    target: null,
                },
            },
            {
                type: 'removeHealth', 
                parameter: {
                    amount: 3,
                    target: null,
                },
            },
        ],
    }
}
