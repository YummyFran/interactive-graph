const tools = document.querySelector(".tools")
const toolHeader = document.getElementById("toolHeader")
const nameInput = document.getElementById("name")
const colorInput = document.getElementById("color")
const childrenContainer = document.getElementById("children")
const childrenHeader = document.getElementById("childHeader")
const toolBtn = document.getElementById("toolBtn")
const deleteBtn = document.getElementById("deleteBtn")
const cardName = document.getElementById("cardName")
const cardColor = document.getElementById("cardColor")

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let lastPoint = {
    x: canvas.width / 3,
    y: canvas.height / 3
}

let nodes = []
let selectedNode = null;

class _Node {
    constructor(name, color, id, size = 10) {
        this.name = name
        this.color = color
        this.id = id
        this.size = size
        this.children = []
        this.isSelected = false

        const points = this.getPoints()
        this.x = points.x
        this.y = points.y

        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    addChild(child) {
        this.children.push(child)
    }

    removeChild(child) {
        this.children.splice(this.children.indexOf(child), 1)
    }

    getPoints() {
        let x = lastPoint.x + (this.size * 4)
        let y = nodes.length % 2 == 1 ? lastPoint.y - (this.size * 8): lastPoint.y + (this.size * 8)

        lastPoint.x = x
        lastPoint.y = y

        return {x, y}
    }

    connectChild() {
        this.children.forEach(child => {
            ctx.beginPath()
            ctx.moveTo(this.x, this.y)
            ctx.lineTo(child.x, child.y)
            ctx.strokeStyle = '#fff'
            ctx.stroke()
        })
    }

    draw() {
        ctx.fillStyle = this.color

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
        ctx.fill()

        ctx.fillStyle = "white"
        ctx.font = "14px Arial"
        ctx.textAlign = "center"
        ctx.fillText(this.name, this.x, this.y - (this.size * 2))

        if(this.isSelected) {
            ctx.strokeStyle = 'white'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.size + 2, 0, Math.PI * 2, false)
            ctx.stroke()
        }
    }

    select() {
        this.isSelected = true
        lastPoint.x = this.x
        lastPoint.y = this.y
        selectedNode = this
    }

    unselect() {
        this.isSelected = false
    }

    isInsideRect(x, y) {
        return (x > this.x - this.size && x < this.x + this.size && y > this.y - this.size && y < this.y + this.size);
    }
}

let nodeId = 0
function addNode(name, color) {
    const node = new _Node(name, color, nodeId)

    const child = document.createElement('div')
    child.classList.add("child")
    child.id = `child_${nodeId}`

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.name = 'child'
    checkbox.id = `checkbox_${nodeId}`
    checkbox.classList.add('checkbox')
    checkbox.value = name

    const label = document.createElement('label')
    label.htmlFor = `checkbox_${nodeId++}`
    label.textContent = name

    child.appendChild(checkbox)
    child.appendChild(label)
    
    childrenHeader.style.display = "block"
    childrenContainer.appendChild(child)
    addChildren(node)
    nodes.push(node)
}

function addChildren(node) {
    const checkboxes = document.querySelectorAll(".checkbox")
    let checkedBoxes = []
    let uncheckedBoxes = []

    checkboxes.forEach(box => {
        if(box.checked) {
            checkedBoxes.push(box.id)
        } else {
            uncheckedBoxes.push(box.id)
        }
    })

    if(node == selectedNode) {
        uncheckedBoxes.forEach(nodeId => {
            nodes.forEach(el => {
                if(el.id == nodeId.slice(9)) {
                    node.removeChild(el)
                    el.removeChild(node)
                }
            })
        })
    }

    checkedBoxes.forEach(nodeId => {
        nodes.forEach(el => {
            if (el.id == nodeId.slice(9)) {
                node.addChild(el)
                el.addChild(node)
            }
        })
    })
}

function editNode(name, color) {
    selectedNode.name = name
    selectedNode.color = color
    addChildren(selectedNode)
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    nodes.forEach(node => {
        node.connectChild()
    })

    nodes.forEach(node => {
        node.draw()
    })
    
    requestAnimationFrame(animate);
}

animate()

function updateTools() {
    if(selectedNode != null) {
        toolHeader.innerText = "Edit Node"
        nameInput.value = selectedNode.name
        colorInput.value = selectedNode.color
        toolBtn.innerText = "Edit Node"
        deleteBtn.style.display = "block"

        const checkboxes = document.querySelectorAll(".checkbox")
        
        checkboxes.forEach(box => {
            box.checked = false
            selectedNode.children.forEach(child => {
                if(child.id == box.id.slice(9)) {
                    box.checked = true
                }
            })
        })        
    } else {
        tools.reset()
        toolHeader.innerText = "Configure Node"
        toolBtn.innerText = "Add Node"
        deleteBtn.style.display = "none"
    }
}

tools.addEventListener("submit", e => {
    e.preventDefault()

    if(selectedNode == null) {
        addNode(nameInput.value, colorInput.value)
        tools.reset()
    }
    if(selectedNode != null) {
        console.log("edit")
        editNode(nameInput.value, colorInput.value)
    }
})

canvas.addEventListener('click', e => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    let topMostNode = null;

    for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].isInsideRect(mouseX, mouseY)) {
            topMostNode = nodes[i]
            break;
        }
    }

    selectedNode = null

    nodes.forEach(node => {
        node === topMostNode ? node.select() : node.unselect()
    })

    updateTools()
})

canvas.addEventListener('mousedown', e => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    let topMostNode = null;

    for (let i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].isInsideRect(mouseX, mouseY)) {
            topMostNode = nodes[i]
            break;
        }
    }

    nodes.forEach(node => {
        if (node === topMostNode) {
            node.isDragging = true
            node.offsetX = mouseX - node.x
            node.offsetY = mouseY - node.y
        }
    })
})

canvas.addEventListener('mouseup', () => {
    nodes.forEach(node => node.isDragging = false)
})

canvas.addEventListener('mousemove', e => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left
    const mouseY = e.clientY - canvas.getBoundingClientRect().top
    
    nodes.forEach(node => {
        if (node.isDragging) {
            node.x = mouseX - node.offsetX
            node.y = mouseY - node.offsetY
        } 
    })
})

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
})

deleteBtn.addEventListener('click', e => {
    e.preventDefault()
    const child = document.querySelectorAll(".child")

    selectedNode.children.forEach(child => {
        child.removeChild(selectedNode)
    })

    child.forEach(box => {
        if(box.id.slice(6) == selectedNode.id) {
           childrenContainer.removeChild(box)
        }
    })

    nodes.splice(nodes.indexOf(selectedNode), 1)
    tools.reset()
    selectedNode = null
    updateTools()
})