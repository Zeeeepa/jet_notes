import { MDXProvider } from "@mdx-js/react";
import { MDXRenderer } from "gatsby-plugin-mdx";

export default (html) => (
  <MDXProvider>
    <MDXRenderer>{html}</MDXRenderer>
  </MDXProvider>
);
