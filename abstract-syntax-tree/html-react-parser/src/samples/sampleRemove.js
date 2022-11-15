import parse, { domToReact } from "html-react-parser";

const html = `
<h2 style="font-family: 'Lucida Grande';">
  HTMLReactParser<br class="remove"> loaded withCreate React App
</h2>
`;

const options = {
  replace: ({ attribs }) => {
    if (!attribs) {
      return;
    }

    if (attribs.class === "remove") {
      return <></>;
    }
  },
};

export default {
  html,
  options,
};
