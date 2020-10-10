for (let i of [1, 2, 3]) {
    console.log(i)
}

// Enable JSX by adding @babel/plugin-transform-react-jsx
// Compiled to React.createElement(\"div\", null) with error: React is not defined
let a = <div/>
