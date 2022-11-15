import parse, { attributesToProps } from "html-react-parser";

const html = `
  <p id="replace">text</p>
`;

const options = {
  replace: ({ attribs }) => {
    if (!attribs) {
      return;
    }

    if (attribs.id === "replace") {
      return <span>replaced</span>;
    }
  },
};

export default {
  html,
  options,
};
