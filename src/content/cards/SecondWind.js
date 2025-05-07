export default{
    name: "SecondWind", //this is what create card will uses to find the card indicated by the string given to it
    cardColor: "Red", //can be Red, Green, Purple, Curse, Colorless
    type: "skill", //can be attack, skill, power, status or curse
    description: "rally and recover 1 energy",
    image: "SecondWind.png",
    energy: 1, //normally a Number
    target: "player", //can be player, enemy, allEnemies
    cardRarity: "Rare", // can be Basic, Special, Curse, Common
    powers: {
        energized: 1, //add your powers here, using the name of the power and then a : and then the number of stacks you want to apply
    },
    actions: [
        {
			type: 'addEnergyToPlayer',
			parameter: {
				amount: 2,
			},
		},
    ]
    /* conditions: [
        {
            type: 'onlyAttack', //the condition goes here
            cardType: 'attack', //the parameters for the condition goes here
        },
    ], */

}

export const upgrade = (card) => {
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        description: "rally and gain 2 energy",
        powers: {
            energized: 2, //add your powers here, using the name of the power and then a : and then the number of stacks you want to apply
            //add a stack of energize here
        },
        actions: [
            {
                type: 'addEnergyToPlayer',
                parameter: {
                    amount: 3,
                },
            },
        ]
    }
}