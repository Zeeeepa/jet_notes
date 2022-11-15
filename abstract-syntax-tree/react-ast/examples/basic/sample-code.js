import React, { FC } from "react";
import {
  Export,
  Expression,
  ExpressionStatement,
  Function,
  Identifier,
  Import,
  Interface,
  JSX,
  ReactNode,
  Return,
  TypeAnnotation,
  TypeReference,
  Var,
  VarKind,
  render,
  Code,
} from "react-ast";

const code = render(
  <>
    <Import default="React" from="react" />

    <Var kind={VarKind.Const} name="Hello">
      <Function arrow params={[<Identifier>props</Identifier>]}>
        <Return>
          <JSX />
        </Return>
      </Function>
    </Var>

    <Expression properties="Hello.defaultProps">{{}}</Expression>
    <Export default>
      <Identifier>Hello</Identifier>
    </Export>
  </>,
  {
    parserOptions: {
      plugins: ["jsx", "classProperties"],
    },
  }
);

console.log(code);
