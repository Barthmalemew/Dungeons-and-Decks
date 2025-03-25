import {html, Component} from '../lib.js'
import {
    weak,
    regen as regen,
    vulnerable as vulnerable,
    strength as strength,
    dexterity,
    frail as frail
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

		if (type === 'damage' && weakened) amount = weakPower.use(amount)
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

function FCT(props) {
	// This avoids animation the value "0".
	if (!props.value) return html`<p></p>`
	return html`<p class="FCT" ...${props}>${props.value}</p>`
}