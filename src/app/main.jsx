import "./style.css";

import { renderDOM } from "@pui-jsx";
import { UI } from "@peasy-lib/peasy-ui";

/* import { render } from "@vanillajs"; */

function App({ children }) {
  const pageTitle = document.querySelector("title").innerText;
  return (
    <div style="text-align: center;">
      <h1>Welcome to my cursed PoC!</h1>
      <h2>{pageTitle}</h2>
      <p>
        There's no way to keep state, but you can render jsx with PUI with some
        intermediary step
      </p>
    </div>
  );
}

renderDOM(UI, document.body, App);
