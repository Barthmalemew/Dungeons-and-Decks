<<<<<<< HEAD
export default
{
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
>>>>>>> 2b3fc570204660ea65d5cf22e8626e45c0d50121
