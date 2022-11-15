import React from "react";
import { renderAst, ClassDeclaration } from "react-ast";

const ast = renderAst(<ClassDeclaration id="Hello" />);

console.log(ast);
