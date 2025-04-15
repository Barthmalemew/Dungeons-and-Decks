import { Component, html } from '../lib.js'
import {debounce, random as randomBetween} from '../../utils.js'
import {isRoomCompleted} from '../../game/utils-state.js'
import { emojiFromNodeType, nodeTypeToName, generatePaths } from '../../game/dungeon.js'
import { object } from 'astro/zod.js'


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
        //makes sure our container element is present
        if(!containerElement) throw new Error('Missing container element');

        const id = `path${preferredIndex}`
        let svg = containerElement.querySelector(`svg#${id}`)
        if(svg) svg.remove();
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.id = id
        svg.classList.add('paths')
        containerElement.appendChild(svg)

        if(debug) console.groupCollapsed(`drawing path on x${preferredIndex}`, path);

        path.forEach((move,index) => {
            const a = nodeFromMove(move[0])
            const b = nodeFromMove(move[1])
            const aEl = elFromNode(move[0])
            const bEl = elFromNode(move[1])

            const aPos = getPosWithin(aEl, containerElement)
            const bPos = getPosWithin(bEl, containerElement)
            if(!aPos.top)
            {
                throw new Error("Could not render the svg path. Check to see if the graphs container element is visible/rendered")
            }
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
            line.setAttribute('x1',String(aPos.left + aPos.width / 2))
            line.setAttribute('y1', String(aPos.top + aPos.height / 2))
            line.setAttribute('x2', String(bPos.left + bPos.width))
            line.setAttribute('y2', String(bPos.top + bPos.height / 2))
            svg.appendChild(line)
            line.setAttribute('length', String(line.getTotalLength()))

            aEl.setAttribute('linked', true)
            bEl.setAttribute('linked',true)

            if(debug) console.log(`Move ${index}`, {from: a, to: b});
        })
        
        if(debug) console.groupEnd();
    }
    //a function to select a node at the given x and y index
    nodeSelect({x,y}) 
    {
        if(this.debug) console.log('nodeSelect', {x,y});
        this.props.onSelect({x,y})
    }

    render(props)
    {
        const {dungeon, x, y} = props
        if(!dungeon.graph) throw new Error('No graph to render. Something went real wrong!', dungeon);

        const currentNode = dungeon.graph[y][x]

        if(isEmpty(currentNode.edges))
        {
            dungeon.paths = generatePaths(dungeon.graph)
            if(this.debug) console.log('generated new dungeon paths', {dungeon});
        }

        return html`
        <dad-map>
            ${dungeon.graph.map(
                (row,rowIndex) => html`
                <dad-map-row current=${rowIndex === y}>
                    ${row.map((node, nodeIndex) => {
                        const isCurrent = rowIndex === y && nodeIndex === x
                        const isConnected = currentNode.edges.has(node.id)
                        const completedCurrentRoom = isRoomComplete(dungeon.graph[y][x].room)
                        const canVisit = isConnected && completedCurrentRoom
                        return html`<dad-map-node
                        key=${`${rowIndex}${nodeIndex}`}
                        type=${Boolean(node.type)}
                        node-type=${node.type}
                        current=${isCurrent}
                        can-visit=${Boolean(canVisit)}
                        did-visit=${node.didVisit}
                        onClick=${() => this.nodeSelect({x:nodeIndex,y:rowIndex})}
                        title=${nodeTypeToName(node.type)}
                        >
                    <span>${emojiFromNodeType(node.type)}</span>
                    </dad-map-node>`
                        })}
                </dad-map-row>
                `,
            )}
        </dad-map>
        `
    }
}

function isEmpty(obj) 
{
    for(const prop in obj)
    {
        if(Object.hasOwn(obj,prop))
        {
            return false
        }
    }
    return true
}


/**
 * this gets the position of an element relative to its parent element
 * @param {HTMLElement} el 
 * @param {HTMLElement} container 
 * @returns 
 */
function getPosWithin(el, container)
{
    if(!el) throw new Error('Could not find DOM node for graph row node');
    if(!container) throw new Error('missing the container');
    const parent = container.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    return {
        top: rect.top - parent.top,
        left: rect.left - parent.left,
        width: rect.width,
        height:rect.height,
    }
}