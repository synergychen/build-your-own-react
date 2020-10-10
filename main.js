// Enable JSX by adding @babel/plugin-transform-react-jsx
// createElement is defined as alias in webpack config
// Transform to:
//   var a = createElement("div", {
//     id: "1",
//     "class": "parent"
//   }, createElement("div", {
//     id: "2",
//     "class": "child"
//   }, "Hello"), createElement("span", null, "World"));

function createElement(type, attributes, ...children) {
    let el
    if (typeof type === "string") {
        el = new ElementWrapper(type)
    } else {
        el = new type
    }
    for (let attrName in attributes) {
        el.setAttribute(attrName, attributes[attrName])
    }
    for (let child of children) {
        if (typeof child === 'string') {
            child = new TextNodeWrapper(child)
        }
        el.appendChild(child)
    }
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
        if (typeof component === 'object' && component.constructor === Array) {
            for(let el of component) {
                this.root.appendChild(el.root)
            }
        } else {
            this.root.appendChild(component.root)
        }
    }
}

// Text node wrapper
class TextNodeWrapper {
    constructor(text) {
        this.root = document.createTextNode(text)
    }
}

// Custom component
class MyComponent {
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

    render() {
        return <div>
            My component
            {this.children}
        </div>
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

function render(component, targetEl) {
    targetEl.appendChild(component.root)
}

// Extract interface of ElementWrapper, TextNodeWrapper and Custom Component would require us to explicitly call render function in order to append to DOM.
render(<MyComponent id="1" class="parent">
    <div id="2" class="child">Hello</div>
    <span>World</span>
</MyComponent>, document.body)
