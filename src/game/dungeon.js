

/**
 * @typedef {object} mapOptions - essentailly a dictionary containing options to influence dungeon generation
 * @prop {number} width - how many rooms per floor
 * @prop {number} height - how many floors
 */

/** @typedef {mapOptions} */
export const defaultOptions = {
    width: 7,
    height: 15
}

class Room
{
    constructor(id)
    {
        this.id = id
        this.adjacent = []
    }
}

/**
 * @typedef {object} Dungeon - the map for the dungeon
 * 
 */

class Dungeon
{
    constructor(options)
    {
        let genOptions = Object.assign(defaultOptions, options)

        this.width = genOptions.width
        this.height = genOptions.height

        this.Map = []
    }

    generateDungeon() {
        
    }

    getMapNodeID(x, y)
    {
        return (y * width) + x
    }

    getMapNodeXY(id)
    {
        return [id % width, Math.floor(id / width)]
    }
}