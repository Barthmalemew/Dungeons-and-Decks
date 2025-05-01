
export default
{
    name: 'True Strike',
    cardColor: 'Purple',
    type: 'skill',
    energy: 1,
    target: 'player',
    description: 'This turn allow your next attack to play twice.',
    //image: 'TrueStrike.png',
    powers: {
        dblAttack: 1,
    }
}

export const upgrade = (card) => {
    return{
        ...card,
        powers: {
            dblAttack: 2,
        },
        description: 'This turn allow your next attack to play thrice.',
    }

}
