// Enable JSX by adding @babel/plugin-transform-react-jsx
// createElement is defined as alias in webpack config, but will still throw error: createElement is not defined
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
// TODO: implement createElement(tagName, attributes, children)
let a = <div id="1" class="parent">
    <div id="2" class="child"/>
    <div id="3" class="child"/>
</div>
