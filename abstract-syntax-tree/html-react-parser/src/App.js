import React from "react";
import parse, { domToReact, htmlToDOM, Element } from "html-react-parser";
import "./App.css";
import sampleParse from "./samples/sampleParse";
import sampleRemove from "./samples/sampleRemove";
import sampleReplace from "./samples/sampleReplace";
import sampleAnchor from "./samples/sampleAnchor";

console.debug(domToReact);
console.debug(htmlToDOM);

const sample = sampleParse;

const html = sample.html;
const options = sample.options;

export default function App() {
  return <div className="App">{parse(html, options)}</div>;
}
