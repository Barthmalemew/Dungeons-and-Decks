import {html, Component} from '../lib.js'
import {
    weak,
    regen as regen,
    vulnerable as vulnerablePower,
    strength as strength,
    dexterity,
    frail as frail,
	poison,
	tempStrength,
	dblAttack,
	energized,
	cultivation,
	armor,
} from '../../game/powers.js'

export const Player = (props) => {
	return html`<${Target} ...${props} type="player" />`
}


export const Monster = (props) => {
	const monster = props.model
	const state = props.gameState
	const intent = monster.intents[monster.nextIntent]

	function MonsterIntent([type, amount]) {
		const weakened = monster.powers.weak
		const vulnerable = state.player.powers.vulnerable

		if (type === 'damage' && weakened) amount = weak.use(amount)
		if (type === 'damage' && vulnerable) amount = vulnerablePower.use(amount)

		let tooltip = ''
		if (type === 'damage') tooltip = `Will deal ${amount} damage`
		if (type === 'block') tooltip = `Will block for ${amount}`
		if (type === 'weak') tooltip = `Will apply ${amount} Weak`
		if (type === 'vulnerable') tooltip = `Will apply ${amount} Vulnerable`
		if (type === 'poison') tooltip = `Will apply ${amount} Poison`

		// Don't reveal how many stacks will be applied.
		if (type === 'vulnerable' || type === 'weak') amount = undefined

		return html`
			<div class="Target-intent ${tooltip && 'tooltipped tooltipped-n'}" aria-label="${tooltip}">
				<img alt=${type} src="/images/${type}.png" /> ${amount}
			</div>
		`
	}

	return html`
		<${Target} ...${props} type="enemy">
			${intent && Object.entries(intent).map((intent) => MonsterIntent(intent))}
		<//>
	`
}

class IntentTooltip extends Component
{
    render(intent) {

        if (!intent) return null

		let tooltip = ''
        if (intent.type === 'damage') 
        {
            tooltip = 'Deals ' + intent.value + ' damage'
        }
        //add more intents types here
        

        return html`
            <span class="tooltipped tooltipped-s" aria-label=${tooltip}>
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
		console.log("Rendering Target health:", hp, "max:", model.maxHealth);
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
    const healthPercent = (value / max) * 100;
    const healthState = 
        healthPercent <= 25 ? 'low' :
        healthPercent <= 50 ? 'medium' : 'high';

    return html`
        <div class="Healthbar ${block ? `Healthbar--hasblock` : ``}">
            <div class="Healthbar-label">
                <span class="Healthbar-numbers">${value}/${max}</span>
            </div>
            <div 
                class="Healthbar-bar" 
                style=${`width: ${(value / max) * 100}%`}
                data-health-percent=${healthState}
            ></div>
			<div class="Healthbar-bar Healthbar-blockBar" style=${`width: ${(block / max) * 100}%`}>
				${block > 0 ? block : ''}
			</div>
        </div>
    `
}

const Powers = (props) => {
	return html`
		<div class="Target-powers">
			<${Power} amount=${props.powers.vulnerablePower} power=${vulnerablePower} />
			<${Power} amount=${props.powers.regen} power=${regen} />
			<${Power} amount=${props.powers.weak} power=${weak} />
			<${Power} amount=${props.powers.strength} power=${strength} />
			<${Power} amount=${props.powers.dexterity} power=${dexterity} />
			<${Power} amount=${props.powers.tempStrength} power=${tempStrength} />
			<${Power} amount=${props.powers.frail} power=${frail} />
			<${Power} amount=${props.powers.poison} power=${poison} />
			<${Power} amount=${props.powers.dblAttack} power=${dblAttack} />
			<${Power} amount=${props.powers.energized} power=${energized} />
			<${Power} amount=${props.powers.cultivation} power=${cultivation} />
			<${Power} amount=${props.powers.armor} power=${armor} />
		</div>
	`
}

const Power = ({power, amount}) => {
	if (!amount) return null
	return html`<span class="tooltipped tooltipped-s" aria-label=${power.description}>
		${power.name} ${amount}
	</span>`
}

function FCT(props) {
	// This avoids animation the value "0".
	if (!props.value) return html`<p></p>`
	return html`<p class="FCT" ...${props}>${props.value}</p>`
}
