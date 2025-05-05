//I don't think it is a good idea to use helper cards this way, as I would have to make a new action to handle it, so for now I shall do effects like this with removeHealth
//however I think I might make some helper actions for this such that it can be invoked if hit animations are tied to cards
export default{
    name: "Shatter",
    cardColor: "Colorless", //can be Red, Green, Purple, Curse, Colorless
    type: "attack", //can be attack, skill, power, status or curse
    description: "Attacks one enemy and does splash damage to all enemies",
    //image: "usually the name of the card as the image file is named [cardName].png",
    energy: 0, //normally a Number
    damage: 3, //also normally a number
    target: "enemy", //can be player, enemy, allEnemies
    cardRarity: "Special", // can be Basic, Special, Curse, Common
    exhaust: true, //a boolean that dictates whether a card should exhaust when played
    ethereal: true, //a boolean that dictates whether a card should exhaust when discarded
    //upgraded this isnt a thing set in cards but rather something createCard adds
    actions: [
		{
			type: 'removeHealth',
			parameter: {
				amount: 3,
				target: 'allEnemies',
			},
		},
	],
}

export const upgrade = (card) => {
    /* const a = card.actions.find((action) => action.type === 'removeHealth')
    console.log('Upgrade activating\na: ',a)
    a.parameter.amount = 4  */
    //the above section doesn't cause the correct effect, as instead of making the upgraded version of the card have the changed values,
    // it makes both the upgraded and unupgraded versions of the card have the value the upgraded version should have
    return{
        ...card, //this makes it so any unchanged values stay unchanged
        damage: 4, //add your changed values here
        actions: [
            {
                type: 'removeHealth',
                parameter: {
                    amount: 4,
                    target: 'allEnemies',
                },
            },
        ],
    }
}