import {shuffle, random} from '..utils.js'

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

export const RoomTypes = {
    "M" : "monster",
    "E" : "event",
    "T" : "treasure",
    "EM" : "empty",
    "B" : "elite",
    "R" : "rest",
    "S" : "merchant"
}

/** @typedef {mapOptions} */
export const defaultOptions = {
    width: 7,
    height: 15,
    minRooms: 2,
    maxRooms: 5,
    roomGen : "MMTE",
    forcedFloors : {
        15 : "R",
        9 : "T"
    }
}

class Room
{
    constructor()
    {
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

        //gen rooms
        for (let i = 0; i < this.height; i++)
        {
            let floor = []

            let numOfRooms = Math.floor(Math.random() * (this.maxRooms - this.minRooms + 1) + this.minRooms)

            numOfRooms = Math.min(numOfRooms, this.width)

            //gen rooms
            for (let j = 0; j < this.width; j++)
            {
                let room = new Room()

                room.type = this.genRoomType(i)

                floor.push(room)
            }

            //fill the floor with empty nodes
            while (floor.length < width)
            {
                let temp = new Room()
                temp.type = RoomTypes.EM

                floor.push(new Room)
            }

            //shuffle floor
            this.Map.push(shuffle(floor))
        }

        //generate random paths between rooms
        for (let starting_room = 0; starting_room < this.width; starting_room++)
        {
            let current_room = this.Map[0][starting_room]

            if (current_room.type == RoomTypes.EM)
            {
                continue
            }

            for (let i = 1; i < this.height; i++)
            {
                let next_room = this.Map[i][Math.floor(Math.random() * this.width)]

                while (next_room.type == RoomTypes.EM)
                {
                    next_room = this.Map[i][Math.floor(Math.random() * this.width)]
                }

                current_room.adjacent.push(next_room)

                current_room = next_room
            }
        }

        //conncect rooms with no connections

        for (let i = 0; i < this.height - 1; i++)
        {
            for (let j = 0; j < this.width; j++)
            {
                let current_room = this.Map[i][j]

                if (current_room.type == RoomTypes.EM)
                {
                    continue
                }

                if (current_room.adjacent.length == 0)
                {
                    let next_room = this.Map[i + 1][Math.floor(Math.random() * this.width)]

                    while (next_room.type == RoomTypes.EM)
                    {
                        next_room = this.Map[i + 1][Math.floor(Math.random() * this.width)]
                    }

                    current_room.adjacent.push(next_room)

                    if (i > 0)
                    {
                        let prev_room = this.Map[i - 1][Math.floor(Math.random() * this.width)]

                        while (prev_room.type == RoomTypes.EM)
                        {
                            prev_room = this.Map[i - 1][Math.floor(Math.random() * this.width)]
                        }

                        prev_room.adjacent.push(current_room)
                    }
                }
            }
        }

    }

    genRoomType(floor)
    {
        let forced = this.forcedFloors[floor]

        if (forced != null)
        {
            return forced
        }

        return this.roomGen[Math.floor(Math.random() * this.roomGen.length)]
    }

    
}