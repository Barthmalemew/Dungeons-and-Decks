<<<<<<< HEAD
export default
{
    //help
    name: 'Unrelenting Barrage',
    cardColor: 'Green',
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
=======
export default
{
    name: 'Unrelenting Barrage',
    color: 'Green',
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
>>>>>>> DND-4-Create-Game-App-Component-with-Room-Management-Combat-Flow
