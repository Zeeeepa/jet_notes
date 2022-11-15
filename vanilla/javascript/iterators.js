export const iterate = (iterator) => {
  const values = [];

  for (const val of iterator) {
    values.push(val);
  }

  return values;
};

export const iterateAsync = async (iterator) => {
  const values = [];

  for await (const val of iterator) {
    values.push(val);
  }

  return values;
};
