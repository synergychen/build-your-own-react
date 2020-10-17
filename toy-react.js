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

// Element wrapper (adapter pattern)
class ElementWrapper {
    constructor(tagName) {
        this.root = document.createElement(tagName)
    }

    setAttribute(name, value) {
        this.root.setAttribute(name, value)
    }

    appendChild(component) {
        const range = new Range()
        // Append to end
        range.setStart(this.root, this.root.childNodes.length)
        range.setEnd(this.root, this.root.childNodes.length)
        component._renderToDOM(range)
    }

    _renderToDOM(range) {
        range.deleteContents()
        range.insertNode(this.root)
    }
}

// Text node wrapper
class TextNodeWrapper {
    constructor(text) {
        this.root = document.createTextNode(text)
    }

    _renderToDOM(range) {
        range.deleteContents()
        range.insertNode(this.root)
    }
}

export class Component {
    constructor() {
        // Create virtual node with attributes but without rendering
        // Need to explicitly render
        this.props = Object.create(null)
        this.children = []
        this._root = null
    }

    setAttribute(name, value) {
        this.props[name] = value
    }

    appendChild(child) {
        this.children.push(child)
    }

    // Switch from render one element to render a range of elements, prepare to re-render and re-paint in next step
    // Range API is best fit for range update
    _renderToDOM(range) {
        // render function returns component vnode
        this.render()._renderToDOM(range)
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

export function render(component, targetEl) {
    let range = new Range()
    range.setStart(targetEl, 0)
    range.setEnd(targetEl, targetEl.childNodes.length)
    range.deleteContents()
    component._renderToDOM(range)
}