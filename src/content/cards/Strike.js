export default
{
    name: 'Strike',
    type: 'attack',
    energy: 1,
    target: 'enemy',
    damage: 7,
    description: 'Strike a target with your blade and Deal 7 damage.',
    cardRarity: 'Basic',
    
}

export const upgrade = (card) => {
    return{
        ...card,
        powers: {
            damage: 10,
    },
        description: 'Strike a target with your blade and Deal 10 damage.',
    }

}

