
export default{
    name: "Arcane Recovery", //this is what create card will uses to find the card indicated by the string given to it
    cardColor: "Purple", //can be Red, Green, Purple, Curse, Colorless
    type: "skill", //can be attack, skill, power, status or curse
    description: "Meditate and regain energy from the etheral power that flows through the dungeon",
    //image: "usually the name of the card as the image file is named [cardName].png",
    energy: 1, //normally a Number
    target: "player", //can be player, enemy, allEnemies
    cardRarity: "Uncommon", // can be Basic, Special, Curse, Common
    //upgraded this isnt a thing set in cards but rather something createCard adds
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
}

export const upgrade = (card) => {
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        description: "Meditate and regain energy this turn and the next from the etheral power that flows through the dungeon",
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