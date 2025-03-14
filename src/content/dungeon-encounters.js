import Dungeon from '../game/dungeon.js'
import {MonsterRoom} from '../game/rooms.js'
import {Monster} from '../game/monster.js'
import {random} from '../utils.js'

export const dungeonWithMap = () => {
	return Dungeon({
		width: 6,
		height: 10,
		minRooms: 3,
		maxRooms: 4,
		customPaths: '0235',
	})
}

