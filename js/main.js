// Struct template
let avl = {
    id: "",
    value: null,
    parent:"",
    left: null,
    right: null,
    height: 1,
    circleEl: null,
    textEl: null
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

let rootIndex = 0

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
    node.value = parseInt(number)
    node.height = 1
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


const balanceFactor = (node) => {
    if(!node) return 0
    
    return getHeight(node.left) - getHeight(node.right)
}

const max = (a,b) => a > b ? a : b

const getHeight = (id) => {
    let node = nodes[findNodeIndex(id)]
    if(!node) return 0
    return node.height
}

const getLine = (from,to) => {
    console.log(`get line from ${from} to ${to}`)
    let line =  lines.find(e => e.getAttribute('data-from') == from && e.getAttribute('data-to') == to)
    console.log(lines)
    console.log(`line exist: ${line}`)
    return line
}

const leftRotate = (id) => {
    let node = nodes[findNodeIndex(id)]
    let nodeRight = nodes[findNodeIndex(node.right)]
    let nodeRightLeft = nodes[findNodeIndex(nodeRight.left)]

    nodeRight.left = node.id
    node.right = nodeRightLeft.id

    nodeRight.height = max(getHeight(nodeRight.left), getHeight(nodeRight.right)) + 1
    node.height = max(getHeight(node.left), getHeight(node.right)) + 1

    return nodeRight.id
}

const rightRotate = (id) => {
    let node = nodes[findNodeIndex(id)]
    let nodeLeft = nodes[findNodeIndex(node.left)]
    let nodeLeftLeft = nodes[findNodeIndex(nodeLeft.left)]
    let nodeLeftRight = nodes[findNodeIndex(nodeLeft.right)]
    let nodeLeftLine = getLine(node.id, node.left);

    nodeLeft.right = node.id
    nodeLeft.parent = node.parent
    node.parent = nodeLeft.id

    node.left = nodeLeftRight ? nodeLeftRight.id : null

    nodeLeft.height = max(getHeight(nodeLeft.left), getHeight(nodeLeft.right)) + 1
    node.height = max(getHeight(nodeLeft.left), getHeight(nodeLeft.right)) + 1

    nodeLeftLine.setAttribute('data-from', nodeLeft.id, node.id)

    let nodeLeftLeftLine = getLine(nodeLeft.id, nodeLeft.left);
    // change nodeleftleft position to the parent
    nodeLeftLeft.cx = nodeLeft.cx
    nodeLeftLeft.cy = nodeLeft.cy

    // change nodeleft position to the parent
    nodeLeft.cx = node.cx
    nodeLeft.cy = node.cy

    // change node position
    node.cx = nodeLeft.cx + (nodeLeft.parent ? dxNext : dx)
    node.cy = nodeLeft.cy + (nodeLeft.parent ? dyNext : dy)

    let { x1, y1, x2, y2 } = getLineCoordinate(nodeLeftLeft)

    // animate nodeLeft to its parent
    gsap.to(nodeLeftLeftLine, {attr: { x1, y1, x2, y2 }, duration: 1, delay: 2, ease: 'power4.out'})
    gsap.to(nodeLeft.circleEl, { attr: { cx: nodeLeft.cx, cy: nodeLeft.cy }, delay: 2, duration: 1, ease: 'power4.out' })
    gsap.to(nodeLeft.textEl, { attr: { x: nodeLeft.cx, y: nodeLeft.cy }, delay: 2, duration: 1, ease: 'power4.out' })
    
    // animate nodeLeftLeft to its former nodeLeft position
    gsap.to(nodeLeftLeft.circleEl, { attr: { cx: nodeLeftLeft.cx, cy: nodeLeftLeft.cy }, delay: 2, duration: 1, ease: 'power4.out' })
    gsap.to(nodeLeftLeft.textEl, { attr: { x: nodeLeftLeft.cx, y: nodeLeftLeft.cy }, delay: 2, duration: 1, ease: 'power4.out' })

    // animate nodeLeftLeft to its former nodeLeft position
    let newline = getLineCoordinate(node)
    gsap.to(nodeLeftLine, {attr: { x1: newline.x1, y1: newline.y1, x2: newline.x2, y2: newline.y2 }, duration: 1, delay: 2, ease: 'power4.out'})
    gsap.to(node.circleEl, { attr: { cx: node.cx, cy: node.cy }, delay: 2, duration: 1, ease: 'power4.out' })
    gsap.to(node.textEl, { attr: { x: node.cx, y: node.cy }, delay: 2, duration: 1, ease: 'power4.out' })

    return nodeLeft.id
}

const highlightElement = (node) => {
    node.circleEl.classList.add('active')
    
    setTimeout(() => {
        node.circleEl.classList.remove('active')
    })
}

const balance = (id) => {
    console.log("balancing "+id)
    let node = nodes[findNodeIndex(id)]
    if(!node) return node

    node.height = max(getHeight(node.left), getHeight(node.right))+1
    console.log(`node ${id} height: ${node.height}, ${node.left}-${node.right}`)

    let bf = balanceFactor(node)

    if(bf > 1 && balanceFactor(node.left) >= 0) {
        console.log("LL balancefactor: "+bf )
        highlightElement(node)
        return rightRotate(node.id)
    }else if(bf > 1 && balanceFactor(node.left) < 0) {
        console.log("LR balancefactor: "+bf )
        highlightElement(node)
        node.left = leftRotate(node.left)
        return rightRotate(node.id)
    }else if(bf < -1 && balanceFactor(node.right) <= 0) {
        console.log("RR balancefactor: "+bf )
        highlightElement(node)
        return leftRotate(node.id)
    }else if(bf < -1 && balanceFactor(node.right) > 0) {
        console.log("RL balancefactor: "+bf )
        highlightElement(node)
        node.right = rightRotate(node.right)
        return leftRotate(node.id)
    }

    

    return node.id
}

const findNodeIndex = (id) => {
    let node = nodes.map((e) => e.id).indexOf(id)
    return node;
}

const getLineCoordinate = (node) => {
    let parent = nodes[findNodeIndex(node.parent)]
    let theta = 25
    let x1r = circleDefaultAttrs.r * Math.cos(theta * (Math.PI/180))
    let x2r = circleDefaultAttrs.r * Math.cos(theta * (Math.PI/180))

    let x1 = node.value > parent.value ? parent.cx + x1r : parent.cx - x1r
    let y1 = parent.cy + circleDefaultAttrs.r * Math.sin(theta * (Math.PI / 180))
    let x2 = node.value > parent.value ? node.cx - x2r : node.cx + x2r
    let y2 = node.cy - circleDefaultAttrs.r * Math.sin(30 * (Math.PI / 180))

    return {x1, y1, x2, y2}
}

const drawNode = (nodeId) => {
    let group = document.createElementNS("http://www.w3.org/2000/svg",'g')
    group.classList.add('node')
    
    let node = nodes[findNodeIndex(nodeId)]
    let parent = nodes[findNodeIndex(node.parent)]
    
    group.classList.add(`node-${node.id}`)

    // if the parent id is root
    let theDx = (parent && parent.id == nodes[rootIndex].id) ? dx : dxNext
    let theDy = (parent && parent.id == nodes[rootIndex].id) ? dy : dyNext

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
        let {x1,y1,x2,y2} = getLineCoordinate(node)
        let line = createLine(x1,y1,x2,y2)

        line.setAttribute('data-from', parent.id)
        line.setAttribute('data-to', node.id)
        linesEl.appendChild(line)
        lines.push(line)

        // animate the line
        gsap.fromTo(line, {attr: {x1,y1,x2:x1, y2:y1}}, {attr:{x1,y1,x2,y2}, duration: 1,  ease:"power4.out"})
    }

    let text = createText(node.value, node.cx, node.cy)

    group.appendChild(circle)
    group.appendChild(text)
    nodesEl.appendChild(group)
    
    node.circleEl = circle
    node.textEl = text 

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

    return balance(currentId)
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
            createNode(nodes[rootIndex].id, value, nodes[rootIndex].id)
            
            // set new root
            rootIndex = nodes.findIndex(e => e.parent == null)
            console.log('set root = '+rootIndex)
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