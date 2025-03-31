{
    name: 'True Strike',
    class: 'all',
    type: 'attack',
    energy: 1,
    target: 'enemy',
    buff: +2,
    description: 'Gain an extra attack to your strike card on the next turn.',
    image: 'TrueStrike.png',
}

export const upgrade = (card) => {
    return{
        ...card,
        powers: {
            buff: +3,
        },
        description: 'Gain an extra attack to 2 of your strike card on the next turn.',
    }

}
