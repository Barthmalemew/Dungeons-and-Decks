
import {html, Component} from '../lib.js'
//because this is dealing with card stuff it might need the file that deals with checking the conditions to see if a card can run

export default class Cards extends Component
{
   
    render(props)
    {
        const cards = props.gameState[props.type];
        return html` <div class="Cards">${cards.map((card) => Card({card, gameState: props.gameState}))}</div>`

    }
}

//this is the function that renders the cards
//it will be incomplete as the file that contains the functions to determine if a card is playable has not yet been created
/**
 * 
 * @param {Object} props preact props object
 * 
 * @param {import('../../game/actions.js').State} [props.gameState] imports the type definition for the State object to be used as a property of the props object
 * @returns A preact html element used in a preact render function
 */
export function Card(props)
{
    const {card, gameState} = props;
    //should probably record if the card can be played so that it can be rendered that way if so
    //need to get the image associated with the card as well

    return html`
    <dad-card
        class="Card"
        data-card-type=${card.type}
        data-card-target=${card.target}
        key=${card.id}
        data-id=${card.id}
        data-card-upgrade=${card.upgraded}

    >
        <div class="Card-inner">
            <p class="Card-energy EnergyBadge">
                <span>${card.energy}</span>
            </p>
            <figure class="Card-media">
                <img src="https://thumbs.dreamstime.com/b/banana-delicious-yellow-white-background-57012810.jpg" alt="A picture of a banana, being used as a placeholder asset" />
            </figure>
            <p class="Card-type">${card.type}</p>
            <h3 class="Card-name">${card.name}</h3>
            <p class="Card-description">${card.description}</p>
        </div>
    </dad-card>
    `
}