let numberOfClasses = 0;

export default function (context) {
  return {
    ClassDeclaration(node) {
      numberOfClasses = numberOfClasses + 1;
      if (numberOfClasses > 1) {
        context.report({
          node,
          message: "You shouldn't use more than one class",
        });
      }
    },
  };
}
