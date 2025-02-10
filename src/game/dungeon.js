

/**
 * @typedef {object} roomTypes - a dictionary containing the percentages associated with each room type
 * @prop {number} monster - the percentage of rooms that contain a monster
 * @prop {number} event - the percentage of rooms that contain an event
 * @prop {number} elite - the percentage of rooms that contain an elite enemy
 * @prop {number} rest - the percentage of rooms that contain a rest area
 * @prop {number} shop - the percentage of rooms that contain a shop
 * @prop {number} treasure - the percentage of rooms that contain a treasure room
 */

/**
 * @typedef {object} mapOptions - essentailly a dictionary containing options to influence dungeon generation
 * @prop {number} width - how many rooms per floor
 * @prop {number} height - how many floors
 */

/** @typedef {mapOptions} */
export const defaultOptions = {
    width: 7,
    height: 15,
    minRooms: 2,
    maxRooms: 5,
    roomTypes: {
        "monster": 0.45,
        "event": 0.22,
        "elite": 0.16,
        "rest": 0.12,
        "shop": 0.05,
        "treasure": 0.00
    }
}

class Room
{
    constructor(id)
    {
        this.id = id
        this.type = null
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
        this.minRooms = genOptions.minRooms
        this.maxRooms = genOptions.maxRooms

        this.roomGen = genOptions.roomTypes

        this.Map = []
    }

    generateDungeon() {
        for (let i = 0; i < this.height; i++)
        {
            let floor = []

            let numOfRooms = Math.floor(Math.random() * (this.maxRooms - this.minRooms + 1) + this.minRooms)

            numOfRooms = Math.min(numOfRooms, this.width)

            for (let j = 0; j < this.width; j++)
            {
                let room = new Room(this.getMapNodeID(j, i))

                let rand = Math.random()

                if (rand < this.roomGen.monster)
                {
                    room.type = "monster"
                }
                else if (rand < this.roomGen.monster + this.roomGen.event)
                {
                    room.type = "event"
                }
                else if (rand < this.roomGen.monster + this.roomGen.event + this.roomGen.elite)
                {
                    room.type = "elite"
                }
                else if (rand < this.roomGen.monster + this.roomGen.event + this.roomGen.elite + this.roomGen.rest)
                {
                    room.type = "rest"
                }
                else if (rand < this.roomGen.monster + this.roomGen.event + this.roomGen.elite + this.roomGen.rest + this.roomGen.shop)
                {
                    room.type = "shop"
                }
                else
                {
                    room.type = "treasure"
                }

                floor.push(room)
            }

            this.Map.push(floor)
        }
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