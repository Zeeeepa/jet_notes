import parse, { domToReact } from "html-react-parser";
import "./App.css";

const html = `
  <p id="main">
    <span class="prettify">
      test replace style props!
    </span>
  </p>
`;

const options = {
  replace: ({ attribs, children }) => {
    if (!attribs) {
      return;
    }

    if (attribs.id === "main") {
      return <h1 style={{ fontSize: 42 }}>{domToReact(children, options)}</h1>;
    }

    if (attribs.class === "prettify") {
      return (
        <span style={{ color: "hotpink" }}>
          {domToReact(children, options)}
        </span>
      );
    }
  },
};

export default function App() {
  return <div className="App">{parse(html, options)}</div>;
}
