// Enable JSX by adding @babel/plugin-transform-react-jsx
// createElement is defined as alias in webpack config
// Transform to:
//   var a = createElement("div", {
//     id: "1",
//     "class": "parent"
//   }, createElement("div", {
//     id: "2",
//     "class": "child"
//   }), createElement("div", {
//     id: "3",
//     "class": "child"
//   }));

function createElement(tagName, attributes, ...children) {
    let el = document.createElement(tagName)
    for (let attrName in attributes) {
        el.setAttribute(attrName, attributes[attrName])
    }
    for (let child of children) {
        el.appendChild(child)
    }
    return el
}

let a = <div id="1" class="parent">
    <div id="2" class="child"/>
    <div id="3" class="child"/>
</div>
console.log(a)
