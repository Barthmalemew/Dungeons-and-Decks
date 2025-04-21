export default
{
    name: 'Bash',
    color: 'Red',
    type: 'attack',
    energy: 2,
    target: 'enemy',
    damage: 8,
    description: 'Deal 8 damage and decrease targets vulnerablility by 2.',
    powers: {
        vulnerable: 2,
    }
}

export const upgrade = (card) => {
    return{
        ...card,
        damage: 10,
        powers: {
            vulnerable: 3,

        },
        description: 'Deal 12 damage and decrease targets vulnerablility by 3.',
    }

}
