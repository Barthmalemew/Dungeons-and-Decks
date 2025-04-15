import {html} from '../lib.js'
import CardChooser from './card-chooser.js'
import {getCardRewards} from '../../game/cards.js'
import {pick} from '../../utils.js'


/**
 * 
 * @param {object} props 
 * @prop {function} props.onSelectCard
 * @prop {object} props.gameState
 * @returns {import('preact').VNode}
 */
export default function VictoryRoom(props) {
    const state = props.gameState
    return html`
    <div class="Container Container--center">
        <h1 center>Victory!</h1>
        <h2 center>placeholder</h2>
        ${!state.didPickCard &&
            html`
            <${CardChooser}
            animate
            cards=${getCardRewards(3)}
            didSelectCard=${(card) => props.onSelectCard(card)}
            />
        `}
    <ul class="Options">
        <button onClick=${props.onContinue}>Continue to the next room</button>
    </ul>
    </div>
    `
}

const victoryRoomIntroTexts = [
    'Well done, but an adventures job is never over.',
    
]