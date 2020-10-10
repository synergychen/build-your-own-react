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
    // TODO: el created by createElement could be DOM elemenet, text node or custom element in this case, need to create generic interface for all
    // The interface will have setAttribute, appendChild methods
    let el
    if (typeof type === "string") {
        // TODO: use adapter pattern with a generic interface
        el = document.createElement(type)
    } else {
        // TODO: use adapter pattern with a generic interface
        el = new type
    }
    for (let attrName in attributes) {
        el.setAttribute(attrName, attributes[attrName])
    }
    for (let child of children) {
        if (typeof child === 'string') {
            // TODO: use adapter pattern with a generic interface
            child = document.createTextNode(child)
        }
        el.appendChild(child)
    }
    return el
}

class MyComponent {
}

let a = <MyComponent id="1" class="parent">
    <div id="2" class="child">Hello</div>
    <span>World</span>
</MyComponent>
console.log(a)
