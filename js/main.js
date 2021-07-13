// Struct template
let avl = {
    id: "",
    value: null,
    parent:"",
    left: null,
    right: null,
    height: 1,
}

const dx = 200
const dy = 100
const dxNext = 100
const dyNext = 100

let viewBox = {
    x: 1200,
    y: 1200
}

let nodes = []
let lines = []

let nodesEl = document.getElementById('nodes')
let linesEl = document.getElementById('lines')

let arcRadius = 50

const circleDefaultAttrs = {
    r: 30,
    fill: "#96BAFF",
    stroke: "#7C83FD",
    "stroke-width": 2,
    class: "circle"
}

const textDefaultAttrs = {
    "text-anchor":"middle" ,
    fill:"#2C2E43",
    class:"nodeValue",
}

const lineDefaultAttrs = {
    "stroke-width":"2",
    stroke:"black",
    class:"nodeLines"
}

const randomId = () => Math.random().toString(36).substr(2, 5);

const newNode = (number, parentId) => {
    let node = Object.assign({}, avl)
    node.parent = parentId
    node.value = number
    node.id = randomId()

    return node;
}

const addDefaultAttrs = (el, attrs) => {
    for(const [key,value] of Object.entries(attrs)) {
        el.setAttribute(key,value)
    }
}

const createCircle = (cx,cy) => {
    let circle = document.createElementNS("http://www.w3.org/2000/svg",'circle')
    circle.setAttribute('cx',cx)
    circle.setAttribute('cy',cy)
    addDefaultAttrs(circle, circleDefaultAttrs)

    return circle
}

const createText = (content,x,y) => {
    let text = document.createElementNS("http://www.w3.org/2000/svg",'text')
    text.setAttribute('x', x)
    text.setAttribute('y', y+5)
    text.innerHTML = content
    addDefaultAttrs(text, textDefaultAttrs)

    return text
}

const createLine = (x1,y1,x2,y2) => {
    let line = document.createElementNS("http://www.w3.org/2000/svg",'line')
    line.setAttribute('x1', x1)
    line.setAttribute('x2', x2)
    line.setAttribute('y1', y1)
    line.setAttribute('y2', y2)
    addDefaultAttrs(line, lineDefaultAttrs)

    return line
}

const findNodeIndex = (id) => {
    let node = nodes.map((e) => e.id).indexOf(id)
    return node;
}

const drawNode = (nodeId) => {
    let group = document.createElementNS("http://www.w3.org/2000/svg",'g')
    group.classList.add('node')
    
    let node = nodes[findNodeIndex(nodeId)]
    let parent = nodes[findNodeIndex(node.parent)]
    
    group.classList.add(`node-${node.id}`)

    // if the parent id is root
    let theDx = (parent && parent.id == nodes[0].id) ? dx : dxNext
    let theDy = (parent && parent.id == nodes[0].id) ? dy : dyNext

    if(!parent) {
        // if no parent, then this is root
        node.cx = viewBox.x / 2,
        node.cy = 100
    } else {
        node.cx = node.value > parent.value ? parent.cx + theDx : parent.cx - theDx
        node.cy = parent.cy + theDy
    }

    let circle = createCircle(node.cx, node.cy)
    if(parent) {
        let theta = 25
        let x1r = circleDefaultAttrs.r * Math.cos(theta * (Math.PI/180))
        let x2r = circleDefaultAttrs.r * Math.cos(theta * (Math.PI/180))

        let x1 = node.value > parent.value ? parent.cx + x1r : parent.cx - x1r
        let y1 = parent.cy + circleDefaultAttrs.r * Math.sin(theta * (Math.PI / 180))
        let x2 = node.value > parent.value ? node.cx - x2r : node.cx + x2r
        let y2 = node.cy - circleDefaultAttrs.r * Math.sin(30 * (Math.PI / 180))
        let line = createLine(x1,y1,x2,y2)

        line.setAttribute('data-from', parent.id)
        line.setAttribute('data-to', node.id)
        linesEl.appendChild(line)

        // animate the line
        gsap.fromTo(line, {attr: {x1,y1,x2:x1, y2:y1}}, {attr:{x1,y1,x2,y2}, duration: 1,  ease:"power4.out"})
    }

    let text = createText(node.value, node.cx, node.cy)

    group.appendChild(circle)
    group.appendChild(text)
    nodesEl.appendChild(group)
    gsap.fromTo(group, {opacity: 0}, {opacity:1, duration: 1, delay:1, ease:"power4.out"})
}

const createNode = (currentId, value, parentId) => {
    let currentNode = nodes[findNodeIndex(currentId)]
    
    if(!currentNode) {
        // if currentNode is null, then insert one
        let create = newNode(value, parentId)
        nodes.push(create)
        drawNode(create.id)

        return create.id
    }

    if(value > currentNode.value) {
        currentNode.right = createNode(currentNode.right, value, currentNode.id)
    } else if (value < currentNode.value) {
        currentNode.left = createNode(currentNode.left, value, currentNode.id)
    }
    return currentNode.id
}

let form = document.getElementById('form')
let formLabel = document.getElementById('input-label')
document.getElementById('insert').addEventListener('click', (e) => {
    form.setAttribute('data-action', 'insert')
    
    formLabel.innerText = "Insert:"
    form.style.display = "block"
})
document.getElementById('remove').addEventListener('click', (e) => {
    form.setAttribute('data-action', 'remove')
    
    formLabel.innerText = "Remove:"
    form.style.display = "block"
})
form.addEventListener('submit', (e) => {
    e.preventDefault()
    let value = document.getElementById('input').value

    switch (form.getAttribute('data-action')) {
        case "remove":

            break;
        case "insert":
            createNode(nodes[0].id, value, nodes[0].id)
            console.log(nodes)
            break;
        default:
            break;
    }
})
const initPage = () => {
    let root = createNode(null,10,null)
    console.log(nodes)
}
initPage()