export default
{
    name: 'Bash',
    class: 'Knight',
    type: 'attack',
    energy: 2,
    target: 'enemy',
    damage: 8,
    debuff: 2,
    description: 'Deal 8 damage and decrease targets vulnerablility by 2.',
}

export const upgrade = (card) => {
    return{
        ...card,
        powers: {
            damage: 12,
            debuff: 3,
        },
        description: 'Deal 12 damage and decrease targets vulnerablility by 3.',
    }

}
