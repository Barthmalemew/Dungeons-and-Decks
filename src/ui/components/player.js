import {html, Component} from '../lib.js'
import {
    weaken as weak,
    regen as regen,
    vulnerable as vulnerable,
    strength as strength,
    dexterity as dexterity,
    frail as frail
} from '../game/powers.js'

export const Player = (props) => {
	return html`<${Target} ...${props} type="player" />`
}


class Monster extends Component
{
    render(props) {
        return html`
		<${Target} ...${props} type="enemy">
			${intent && Object.entries(intent).map((intent) => MonsterIntent(intent))}
		<//>
	`
    }
}

class intentTooltip extends Component
{
    render(intent) {

        if (!intent) return null

        if (intent.type === 'damage') 
        {
            tooltip = 'Deals ' + intent.value + ' damage'
        }
        //add more intents types here
        

        return html`
            <span class="tooltipped tooltipped-s" aria-label=${intent}>
                ${intent}
            </span>
        `
    }
}

class Target extends Component
{
    render({model, type, name, children}, state) {
		const isDead = model.currentHealth < 1
		const hp = isDead ? 0 : model.currentHealth
		return html`
			<div class=${`Target${isDead ? ' Target--isDead' : ''}`} data-type=${type}>
				<h2><span class="Target-name">${name}</span> ${children}</h2>
				<${Healthbar} max=${model.maxHealth} value=${hp} block=${model.block} />
				<${Powers} powers=${model.powers} />
				<div class="Target-combatText Split">
					<${FCT} key=${model.block} value=${model.block} class="FCT FCT--block" />
					<${FCT} key=${hp} value=${state.lostHealth} />
				</div>
			</div>
		`
	}
}

function Healthbar({value, max, block}) {
    return html`
        <div class="Healthbar ${block ? `Healthbar--hasblock` : ``}">
            <p class="healthbar-label">
                <span>${value}/${max}</span>
            </p>
            <div class="Healthbar-bar" style=${`width: ${(value / max) * 100}%`}></div>
            <div class="Healthbar-bar Healthbar-blockBar" style=${`width: ${(block / max) * 100}%`}>
                ${block > 0 ? block : ``}
            </div>
        </div>
    `
}

const Powers = (props) => {
	return html`
		<div class="Target-powers">
			<${Power} amount=${props.powers.vulnerable} power=${vulnerable} />
			<${Power} amount=${props.powers.regen} power=${regen} />
			<${Power} amount=${props.powers.weak} power=${weak} />
			<${Power} amount=${props.powers.strength} power=${strength} />
			<${Power} amount=${props.powers.frail} power=${frail} />
		</div>
	`
}

const Power = ({power, amount}) => {
	if (!amount) return null
	return html`<span class="tooltipped tooltipped-s" aria-label=${power.description}>
		${power.name} ${amount}
	</span>`
}