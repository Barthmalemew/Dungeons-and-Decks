export default{
    name: 'Shadow Walk',
    cardColor: 'Green',
    type: 'Skill',
    energy: 3,
    target: 'player',
    block: 10,
    description: 'Create a shadow illusion of yourself to gain 10 block.',
    image: 'ShadowWalk.png',
}

export const upgrade = (card) => {
    return {
        ...card,
        block: 15,
        energy: 2,
        description: 'Create a shadow illusion of yourself to gain 15 block.',
    }
}