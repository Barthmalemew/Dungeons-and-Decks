import {html, Component} from '../lib.js'

export default class StartRoom extends Component {
    render(props) {
        return html`
        <div class="Container">
            <h1 center>Welcome, Adventurer!</h1>
            <p center>Your journey through the dungeon begins here. Choose your path wisely.</p>

            <div class="Box"> 
                <ul class="Options">
                    <li>
                        <button onClick=${() => props.onContinue()}>Open the map</button>
                    </li>
                </ul>
            </div>

            <p center>
                <a href="/">Return to Menu</a>
            </p>
        </div>
        `
    }
}
