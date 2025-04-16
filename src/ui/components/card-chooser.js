import {html, Component} from '../lib.js'
import gsap from '../animations.js'
import {Card} from './cards.js'

export default class CardChooser extends Component {
    componentDidMount()
    {
        if(this.props.animate)
        {
            const cards = this.base.querySelectorAll('.CardBox')
            gsap.effects.dealCards(cards)
        }
    }

    clickedCard(card) {
        const cardEl = this.base.querySelector(`[data-id="${card.id}"]`)
        setTimeout(() => {
            this.props.didSelectCard(card)
        }, 300)
        gsap.effects.addCardToDeck(cardEl).then(() => {

        })
    }

    render(props) {
        return html`
        <article class="RewardsBox">
            <div class="Cards">
                ${props.cards.map(
                    (card) =>
                        html`<div class="CardBox" onClick=${() => this.clickedCard(card)}>
                            ${Card({card, gameState: props.gameState})}
                        </div>`,
                )}
            </div>
        </article>
        `
    }
}