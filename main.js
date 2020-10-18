import { createElement, Component, render } from './toy-react.js'

class MyComponent extends Component {
    constructor() {
        super()
        this.state = {
            a: 1,
            b: 2
        }
    }

    render() {
        // Render custom DOM and its children
        let el = <div>
            <h1>My component</h1>
            <span>State a: { this.state.a.toString() }</span>
            <button onclick={ () => { this.setState({ a: this.state.a + 1 }) } }>Add</button>
            {this.children}
        </div>
        // Set attributes
        for(let propName in this.props) {
            el.setAttribute(propName, this.props[propName])
        }
        return el
    }
}

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
//
// Extract interface of ElementWrapper, TextNodeWrapper and Custom Component would require us to explicitly call render function in order to append to DOM.
render(<MyComponent id="my-component" class="parent">
    <div id="hello-world" class="child">Hello World</div>
</MyComponent>, document.body)
