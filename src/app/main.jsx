import "./style.css";
import { render } from "@vanillajs";

function App({ children }) {
  const pageTitle = document.querySelector("title").innerText;
  return (
    <>
      <h1>Welcome to my cursed PoC!</h1>
      <h2>{pageTitle}</h2>
      {...children}
    </>
  );
}

render(document.body, App);
