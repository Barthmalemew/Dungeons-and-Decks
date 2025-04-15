import { Component, html } from '../lib.js'
import {debounce, random as randomBetween} from '../../utils.js'
import {isRoomCompleted} from '../../game/utils-state.js'
import { emojiFromNodeType, nodeTypeToName, generatePaths } from '../../game/dungeon.js'


/**
 * This is the code that renders the maps and allows players to select rooms to visit along with showing possible next moves and room types
 * @param {object} props
 * @param {object} props.dungeon
 * @param {number} props.x - The starting column
 * @param {number} props.y - The starting row
 * @param {number} props.scatter - Determines whether to visually move the nodes randomly a bit
 * @param {Function} props.onSelect - The function called on the map node select
 * @param {Boolean} props.debug - A boolean that if true, will console.log things
 */

export class DadMap extends Component {
    constructor(props)
    {
        super()
        this.didDrawPaths = false
        this.debug = props.debug
    }

    componentDidMount()
    {
        this.drawPathsDebounced = debounce(this.drawPathsDebounced.bind(this), 300, {leading: true, trailing : true})
        //this triggers an update
        this.setState({universe: 42})
    }

    componentDidUpdate(preProps)
    {
        const newDungeon = this.props.dungeon.id !== preProps?.dungeon.id
        //this sets the correct number of columns and rows in the css
        this.base.style.setProperty('--rows', Number(this.props.dungeon.graph.length))
        this.base.style.setProperty('--columns', Number(this.props.dungeon.graph[1].length))

        //this checks to see if the dungeon has been drawn
        if(newDungeon || !this.didDrawPaths)
        {
            this.drawPathsDebounced()
            this.scatterNodes()
        }

        if(!this.resizeObserver)
        {
            this.resizeObserver = new ResizeObserver(() => {
                this.drawPathsDebounced()
            })
            this.resizeObserver.observe(this.base)
        }
    }

    scatterNodes()
    {
        const distance = Number(this.props.scatter)
        if(!distance) return
        if(this.debug) console.log('scattering map nodes with a type')
        const nodes = this.base.querySelectorAll('dad-map-node[type]')
        //this is what is actually moving the nodes positions around
        nodes.forEach((node) => {
            node.style.transform = `translate3d(
            ${randomBetween(-distance, distance)}%,
            ${randomBetween(-distance, distance)}%,
            0)`
        })
    }

    //this draws the SVG lines between the DOM nodes from the dungeon's path, however it might be a bit intensive so it should be done as little as possible
    drawPaths() 
    {
        if(this.debug) console.time('drawPaths');
        if(this.debug) console.groupCollapsed(`drawing ${this.props.dungeon.paths.length} paths`);

        const existingPaths = this.base?.querySelectorAll(`svg.paths`) || []
        for (const p of existingPaths)
        {
            p.remove()
        }

        this.props.dungeon.paths.forEach((path,index) => {
            this.drawPath(path,index)
        })

        this.didDrawPaths = true

        if(this.debug) console.groupEnd();
        if(this.debug) console.timeEnd('drawPaths');
    }

    /**
     * Draws an SVG path on a certain column or x index
     * @param {Array<object>} path
     * @param {number} preferredIndex
     */
    drawPath(path,preferredIndex)
    {
        const graph = this.props.dungeon.graph
        const containerElement = this.base
        const debug = this.debug

        const nodeFromMove = ([row, col]) => graph[row][col]
        const elFromNode = ([row,col]) => containerElement.childNodes[row].childNodes[col]

        
    }
}