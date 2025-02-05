import {html, Component} from '../lib.js'
import {getRuns} from '../../game/backend.js'
import {timeSince} from '../../utils.js'
import gsap from '../animations.js'

export default class SplashScreen extends Component {
	constructor() {
		super()
		this.state = {runs: []}
	}

	componentDidMount() {
		getRuns().then(({runs}) => this.setState({runs}))

		gsap.from(this.base, {duration: 0.3, autoAlpha: 0, scale: 0.98})
		gsap.to(this.base.querySelector('.Splash-spoder'), {delay: 5, x: 420, y: 60, duration: 3})
	}

	render(props, state) {
		const run = state.runs[0]

		return html`
			<article class="Splash Container">
				<header class="Header">
					<h1>Dungeons and Decks</h1>
					<h2>Placeholder description</h2>
				</header>
				<div class="Box">
					<ul class="Options">
						${location.hash
							? html`
								<li>Found a saved game. <button autofocus onClick=${props.onContinue}>Continue?</button></li>
								<li><button onClick=${props.onNewGame}>New Game</a></li>
					`
							: html`
							<li><button autofocus onClick=${props.onNewGame}>Play</a></li>
							<li><a class="Button" href="/?debug&tutorial">Tutorial</a></li>
							`}
						<li><a class="Button" href="/collection">Collection</a></li>
						<li>
							<a class="Button" href="/stats">Highscores</a>
							${this.state.runs.length > 0
								? html` <a class="LastRun" href=${`/stats/run?id=${run.id}`}>
										${timeSince(run.createdAt)} someone ${run.won ? 'won' : 'lost'}
									</a>`
								: ''}
						</li>
					</ul>
					<p center><a href="/changelog">Changelog</a> & <a href="/manual">Manual</a></p>
				</div>
			</article>
		`
	}
}