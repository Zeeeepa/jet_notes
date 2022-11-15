const readdir = require("node:fs/promises");

const rootFolder = `${__dirname}/root`;

const run = async () => {
  try {
    const files = await readdir(rootFolder);
    for (const file of files) console.log(file);
  } catch (err) {
    console.error(err);
  }
};

run();
