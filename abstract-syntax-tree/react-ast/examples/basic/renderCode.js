import React from "react";
import {
  ClassDeclaration,
  FunctionDeclaration,
  ReturnStatement,
  render,
  Bas,
  Code,
} from "react-ast";

const code = render(
  <>
    <ClassDeclaration id="Hello" superClass="Array">
      <Code>hello = 'world'</Code>
    </ClassDeclaration>
    <FunctionDeclaration
      id="add"
      params={["a", "b"]}
      // returnType={<ReturnStatement>result</ReturnStatement>}
    >
      <Code>const result=a+b</Code>
    </FunctionDeclaration>
  </>
);

console.log(code);
