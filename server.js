const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const { searchFilesMapping, getPathInfo } = require("./utils/file");
const { removeEmptyValues } = require("./utils/object");

const app = express();

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options("*", cors());

(async () => {
  const dirsMap = await searchFilesMapping(__dirname, {
    excludes: [
      (file, stats) => {
        const { fileName, directory } = getPathInfo(file);
        let shouldExclude = false;

        if (stats.isDirectory()) {
          shouldExclude =
            file.includes("node_modules") || file.includes(".git");
        } else {
          shouldExclude = directory === __dirname;
        }

        shouldExclude || fileName.startsWith(".");

        return shouldExclude;
      },
    ],
  });

  const staticPaths = [];

  for (const dir in dirsMap) {
    const files = dirsMap[dir];
    const firstPath = removeEmptyValues(dir.split("/"))[0];
    const path = `/${firstPath}`;

    if (files.includes("index.html")) {
      app.use(path, express.static(dir));

      staticPaths.push({
        host: `http://localhost:8000${path}`,
        dir,
      });
    }
  }

  console.debug("Static paths:\n", staticPaths);

  app.listen(8000, () =>
    console.log("Server listening on http://localhost:8000!")
  );
})();
