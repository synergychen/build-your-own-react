export function createElement(type, attributes, ...children) {
    let el
    // Create instance
    if (typeof type === "string") {
        el = new ElementWrapper(type)
    } else {
        el = new type
    }
    // Handle attributes
    for (let attrName in attributes) {
        el.setAttribute(attrName, attributes[attrName])
    }
    // Handle children
    let insertChildren = (children) => {
        for (let child of children) {
            if (child === null) {
                continue
            }
            if (typeof child === 'string') {
                child = new TextWrapper(child)
            }
            if (typeof child === 'object' && child instanceof Array) {
                insertChildren(child)
            } else {
                el.appendChild(child)
            }
        }
    }
    insertChildren(children)
    return el
}

export class Component {
    constructor() {
        // Create virtual node with attributes but without rendering
        // Need to explicitly render
        this.props = Object.create(null)
        this.children = []
        this._range = null
    }

    setAttribute(name, value) {
        this.props[name] = value
    }

    appendChild(child) {
        this.children.push(child)
    }

    // Virtual dom is more efficient than using range api to refresh full DOM node / tree.
    get vdom() {
        return this.render().vdom
    }

    setState(newState) {
        if (this.state === null || typeof this.state !== 'object') {
            this.state = newState
            this.update()
            return
        }

        const merge = (oldState, newState) => {
            for (let p in newState) {
                if (oldState[p] === null || typeof oldState[p] !== 'object') {
                    oldState[p] = newState[p]
                } else {
                    merge(oldState[p], newState[p])
                }
            }
        }

        merge(this.state, newState)
        this.update()
    }

    // Switch from render one element to render a range of elements, prepare to re-render and re-paint in next step
    // Range API is best fit for range update
    _renderToDOM(range) {
        this._range = range
        // Remember old vdom in order for "update" step to compare new and old vdom
        this.oldVdom = this.vdom
        // render function returns component vnode
        this.oldVdom._renderToDOM(range)
    }

    // Core part: vdom diff
    update() {
        let isSameNode = (oldNode, newNode) => {
            // For simplicity, return false if any is not the same:
            // node type
            if (oldNode.type !== newNode.type) {
                return false
            }
            // prop
            for (let name in newNode.props) {
                if (newNode[name] !== oldNode[name]) {
                    return false
                }
            }
            // prop length
            if (Object.keys(newNode.props).length !== Object.keys(oldNode.props).length) {
                return false
            }
            // text content
            if (newNode.type === '#text') {
                if (newNode.content !== oldNode.content) {
                    return false
                }
            }

            return true
        }

        let update = (oldNode, newNode) => {
            if (!isSameNode(oldNode, newNode)) {
                newNode._renderToDOM(oldNode._range)
                return
            }

            newNode._range = oldNode._range

            let oldChildren = oldNode.vchildren
            let newChildren = newNode.vchildren

            if (!newChildren || !newChildren.length) {
                return
            }

            let tailRange = oldChildren[oldChildren.length - 1]._range
            for (let i = 0; i < newChildren.length; i++) {
                let oldChild = oldChildren[i]
                let newChild = newChildren[i]
                if (i < oldChildren.length) {
                    update(oldChild, newChild)
                } else {
                    let range = new Range()
                    range.setStart(tailRange.endContainer, tailRange.endOffset)
                    range.setStart(tailRange.endContainer, tailRange.endOffset)
                    newChild._renderToDOM(range)
                }
            }
        }

        let oldVdom = this.oldVdom
        let newVdom = this.vdom
        update(oldVdom, newVdom)
        this.oldVdom = newVdom
    }
}

// Element wrapper (adapter pattern)
class ElementWrapper extends Component {
    constructor(type) {
        super()
        this.type = type
    }

    get vdom() {
        // Make sure every time when get a vdom, vchildren is always available
        this.vchildren = this.children.map(child => child.vdom)
        return this
    }

    _renderToDOM(range) {
        this._range = range
        range.deleteContents()

        let root = document.createElement(this.type)

        // Set props and events
        for (let name in this.props) {
            let value = this.props[name]
            if (name.match(/^on([\s\S]+)$/)) {
                const eventName = RegExp.$1.replace(/^[\s\S]/, e => e.toLowerCase())
                root.addEventListener(eventName, value)
            } else {
                root.setAttribute(name, value)
            }
        }

        // Double check to make sure vchildren is available
        if (!this.vchildren) {
            this.vchildren = this.children.map(child => child.vdom)
        }

        // Render children
        for (let child of this.vchildren) {
            const childRange = new Range()
            // Append to end
            childRange.setStart(root, root.childNodes.length)
            childRange.setEnd(root, root.childNodes.length)
            child._renderToDOM(childRange)
        }

        replaceContent(range, root)
    }
}

// Text node wrapper
class TextWrapper extends Component {
    constructor(content) {
        super()
        this.type = '#text'
        this.content = content
    }

    _renderToDOM(range) {
        this._range = range
        let root = document.createTextNode(this.content)
        replaceContent(range, root)
    }

    get vdom() {
        // Make sure every time when get a vdom, vchildren is always available
        this.vchildren = this.children.map(child => child.vdom)
        return this
    }
}

function replaceContent(range, node) {
    range.insertNode(node)
    range.setStartAfter(node)
    range.deleteContents()
    range.setStartBefore(node)
    range.setEndAfter(node)
}

export function render(component, targetEl) {
    let range = new Range()
    range.setStart(targetEl, 0)
    range.setEnd(targetEl, targetEl.childNodes.length)
    range.deleteContents()
    component._renderToDOM(range)
    console.log(component)
}