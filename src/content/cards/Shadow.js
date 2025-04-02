export default{
    name: 'Shadow',
    cardColor: 'Green',
    type: 'Skill',
    energy: 3,
    target: 'enemy',
    damage: 6,
    description: 'Create 2 dark clones and gain 6 damage to your next attack cards.(Last for one round)',
    image: 'Shadow.png',
}

export const upgrade = (card) => {
    return {
        power: {
            damage: +10,
        },
        description: 'Create 2 dark clones and gain 10 damage to your attack cards.(Last for one round)',
    }
}