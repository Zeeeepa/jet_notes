import { createRoot } from "react-dom/client";
import parse from "html-react-parser";

import "../App.css";

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

const options = {
  replace: (domNode) => {
    if (domNode.attribs && domNode.attribs.class === "remove") {
      return <></>;
    }
  },
};

export default {
  html,
  options,
};
