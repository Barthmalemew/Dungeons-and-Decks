export default {
    name: 'Shield',
    type: 'skill',
    energy: 1,
    target: 'player',
    block: 5,
    description: 'Raise your sword in a blocking stance and gain 5 block',
    cardRarity: 'Basic',
    image: 'Shield.png',
    
}

export const upgrade = (card) => {
    return {
        ...card,
        powers: {
            block: 10,
        },
        description: 'Raise your sword in a blocking stance and gain 10 block',
    }

}