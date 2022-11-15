export const getTextNodes = (element) => {
  return Array.from(element.childNodes).filter((node) => {
    return node.nodeType == Node.TEXT_NODE;
  });
};
