import { tempStrength } from "@/game/powers"

export default{
    name: 'Shadow',
    cardColor: 'Green',
    type: 'Skill',
    energy: 2,
    target: 'enemy',
    damage: 6,
    description: 'Create 2 dark clones and gain 6 damage to your next attack cards.(Last for one round)',
    image: 'Shadow.png',
    powers:
    {
        tempStrength: 6,
    },
}

export const upgrade = (card) => {
    return {
        ...card,
        description: 'Create 2 dark clones and gain 10 damage to your attack cards.(Last for one round)',
        powers: 
        {
            tempStrength: 10,
        },
    }
}