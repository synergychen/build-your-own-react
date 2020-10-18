export function createElement(type, attributes, ...children) {
    let el
    if (typeof type === "string") {
        el = new ElementWrapper(type)
    } else {
        el = new type
    }
    for (let attrName in attributes) {
        el.setAttribute(attrName, attributes[attrName])
    }
    let insertChildren = (children) => {
        for (let child of children) {
            if (typeof child === 'string') {
                child = new TextNodeWrapper(child)
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
        this._root = null
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
            this.rerender()
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
        this.rerender()
    }

    // Switch from render one element to render a range of elements, prepare to re-render and re-paint in next step
    // Range API is best fit for range update
    _renderToDOM(range) {
        this._range = range
        // render function returns component vnode
        this.render()._renderToDOM(range)
    }

    rerender() {
        this._range.deleteContents()
        this._renderToDOM(this._range)
    }

    // Enable access to DOM node
    get root() {
        if (!this._root) {
            // render returns ElementWrapper or TextNodeWrapper or Custom Component
            // if root returns Custom Component, it will recursively call root until returning ElementWrapper or TextNodeWrapper
            this._root = this.render().root
        }
        return this._root
    }
}

// Element wrapper (adapter pattern)
class ElementWrapper extends Component {
    constructor(type) {
        super()
        this.type = type
        this._root = document.createElement(type)
    }

    // setAttribute(name, value) {
    //     if (name.match(/^on([\s\S]+)$/)) {
    //         const eventName = RegExp.$1.replace(/^[\s\S]/, e => e.toLowerCase())
    //         this._root.addEventListener(eventName, value)
    //     } else {
    //         this._root.setAttribute(name, value)
    //     }
    // }

    // appendChild(component) {
    //     const range = new Range()
    //     // Append to end
    //     range.setStart(this._root, this._root.childNodes.length)
    //     range.setEnd(this._root, this._root.childNodes.length)
    //     component._renderToDOM(range)
    // }

    get vdom() {
        return {
            type: this.type,
            props: this.props,
            children: this.children.map(child => child.vdom)
        }
    }

    _renderToDOM(range) {
        range.deleteContents()
        range.insertNode(this._root)
    }
}

// Text node wrapper
class TextNodeWrapper extends Component {
    constructor(content) {
        super()
        this.content = content
        this._root = document.createTextNode(content)
    }

    _renderToDOM(range) {
        range.deleteContents()
        range.insertNode(this._root)
    }

    get vdom() {
        return {
            type: '#text',
            content: this.content
        }
    }
}

export function render(component, targetEl) {
    let range = new Range()
    range.setStart(targetEl, 0)
    range.setEnd(targetEl, targetEl.childNodes.length)
    range.deleteContents()
    console.log(component.vdom)
    component._renderToDOM(range)
}