import React from "react";
import { createRoot } from "react-dom/client";
import parse, {
  DOMNode,
  Element,
  HTMLReactParserOptions,
} from "html-react-parser";

import "./styles.css";

const html = `
  <div class="App" style="text-align: center;">
    <h1>html-react-parser</h1>
    <p>
      <a
        href="https://github.com/remarkablemark/html-react-parser"
        target="_blank"
        rel="noopener noreferrer"
      >
        View GitHub repository
      </a>
    </p>
    <hr class="remove">
  </div>
`;

const options: HTMLReactParserOptions = {
  replace: (domNode: DOMNode) => {
    if (
      domNode instanceof Element &&
      domNode.attribs &&
      domNode.attribs.class === "remove"
    ) {
      return <></>;
    }
  },
};

function App() {
  return <>{parse(html, options)}</>;
}

createRoot(document.getElementById("root")!).render(<App />);
