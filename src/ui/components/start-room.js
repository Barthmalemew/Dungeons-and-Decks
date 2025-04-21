import {html, Component} from '../lib.js'

export default class StartRoom extends Component {

	render(props) 
    {
		return html`
        <div class="container">
            <h1 center> Start </h1>
            <p center>small description </p>

            <div class="box"> 
                <ul class="options">
                    <li><button onClick=${() => this.props.onContinue()}>Open the map</button></li>
                </ul>
            </div

            <p center>
					<a href="/">Let me out</a>
			</p>
        </div>
        `
    }
}