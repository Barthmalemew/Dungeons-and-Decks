export default
{
    name: 'Unrelenting Barrage',
    class: 'Rogue',
    type: 'attack',
    energy: 1,
    target: 'enemy',
    damage: 5,
    description: 'attack a group of enemies randomly and deal 5 damage',
    image:'unrelenting barrage.png',
}

export const upgrade = (card) =>{
    return {
        ...card,
        powers: {
            damage: 7,
        },
        description: 'attack a group of enemies randomly and deal 7 damage',
    }
}
