import "./style.css";
/**
 * @typedef {import('../pui-jsx').modelData} modelData
 * @typedef {import('../pui-jsx/types').JSX} JSX
 * @typedef {import('../pui-jsx').FC} FC
 */

import { renderDOM, modelData } from "@pui-jsx";
import { UI } from "@peasy-lib/peasy-ui";

/**
 * @type {FC}
 */
function Counter() {
  // NOTE: counter here doesn't return the actual value, but an object that WILL loosely transform into primitives
  // Actual value is stored in value property ie `counter().value`
  // `state().value` should not be used when rendering as this will make it static and won't be update on the DOM
  const [counter, setCounter] = modelData(0);
  return (
    <button className="p-4" onClick={() => {
      /* setCounter((x) => x + 1); */
      setCounter(counter() + 1);
    }}>Clicked {counter()} times!</button>
  );
}

/**
 * @type {FC}
 */
function EchoInput() {
  const [text, setText] = modelData("");
  return (
    <div className="flex flex-col gap-1 w-3/4 align-center">
      <input className="w-full" type="text" onInput={(event) => {
        setText(event.target.value);
      }} />
      <span className="text-start w-full">Echo: {text()}</span>
    </div>
  );
}

/**
 * @type {FC}
 */
function List() {
  const foo = "abcdefghijkmnlopqrstuvwxyz".split("");
  return (
    <div className="flex gap-1">
      The alphabet is:
      {foo.map(ch => <span>{ch}</span>)}
    </div>
  );
}

/**
 * @type {FC}
 */
function App() {
  const pageTitle = document.querySelector("title").innerText;
  const stateFnName = "modelData";
  const [counter, _setCounter] = modelData(0);
  return (
    <div className="text-center">
      <h1>Welcome to my cursed PoC!</h1>
      <h2>{pageTitle}</h2>
      <p>
        There's some limited state, but you can render jsx with PUI with some
        intermediary step. Ain't that cool!
      </p>
      <div className="flex flex-col gap-2 align-center">
        <List />
        <Counter />
        <EchoInput />
        <h2>How state operates</h2>
        <h3>Use a function to create State node</h3>
        <p>The way to have state is to use the function <code>{stateFnName}</code></p>
        <code>let [counter, setCounter] = {stateFnName}(0);</code>
        <h3>Getter Returns An Object</h3>
        <p>Value returned from getter is NOT the real value:<br /><code>typeof counter() == "{typeof counter()}"</code></p>
        <h3>True Value is Easily Accessed</h3>
        <p>Value returned from getter includes a value property that is the real value:<br /><code>typeof counter().value == "{typeof counter().value}"</code></p>
        <h3>Sometimes They Are Loosely Equal</h3>
        <p>Value returned from getter can be loosely equal to real value if real value is string or number:<br /><code>(counter().value == counter()) === {counter().value == counter()}</code></p>
        <p>I recognize that this functionality can be abused but I trust you to shoot yourself in the foot only once or twice :D</p>
      </div>
    </div >
  );
}

/**
 * @type {import("@peasy-lib/peasy-ui").UIView}
 */
const view = renderDOM(UI, document.body, App);
view.attached.then(() => {
  console.log("We attached to this DOM epically like a BOSSS");
}).catch((err) => {
  console.error("That model was too skibidi, totally not fly. Resolve error to be lit fam", err);
});
console.log("Generated model:", view.model);

