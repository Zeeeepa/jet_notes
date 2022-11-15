const { exec } = require("child_process");
const fs = require("fs");
const fsPromises = require("fs/promises");
const recursiveReadDir = require("recursive-readdir");
const path = require("path");
const flatten = require("lodash/flatten");
const { runPromise, asyncPromises } = require("./promise");
const {
  replaceWords,
  replaceStrings,
  getMatches,
  replace,
} = require("./string");
const { removeEmptyValues } = require("./object");
const { convertArrayToObjectByKeys } = require("./array");

const getName = (fileName) => {
  const filePaths = removeEmptyValues(fileName.split(".").slice(0, -1));

  return filePaths[0] || "";
};

const getFileExt = (fileName) => {
  const fileExt = fileName.split(".").pop();

  return fileExt;
};

const getFileName = (pathString) => {
  const filePaths = removeEmptyValues(pathString.split("/").slice(-1));

  return filePaths[0] || "";
};

const getPathInfo = (pathString, dirName = __dirname) => {
  const paths = pathString.split("/");
  const fileName = paths.pop();
  const name = getName(fileName);
  const ext = getFileExt(fileName);
  const directory = paths.join("/");

  const absolutePath = path.join(dirName, pathString);
  const relativePath = path.join(directory, fileName);

  return { name, ext, fileName, directory, relativePath, absolutePath };
};

const checkIfPathExists = (pathString) => {
  return runPromise((resolve) => {
    fs.access(pathString, (err) => {
      if (err && err.code === "ENOENT") {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const createDirectory = (pathString) => {
  return runPromise((resolve, reject) => {
    //Create dir in case not found
    fs.mkdir(pathString, { recursive: true }, (err) => {
      if (err) {
        console.error(err);

        return reject(err);
      }

      console.info("Created directory:", pathString);

      resolve(pathString);
    });
  });
};

const createPathIfMissing = (pathString) => {
  const stats = checkPathStats(pathString);

  if (!stats.exists) {
    return createDirectory(pathString);
  }
};

const checkPathStats = (pathString) => {
  let stats = {
    exists: false,
    isFile: false,
    isDirectory: false,
    ...getPathInfo(pathString),
  };

  try {
    const statsResult = fs.statSync(pathString);

    stats = Object.assign(stats, {
      exists: true,
      isFile: statsResult.isFile(),
      isDirectory: statsResult.isDirectory(),
    });
  } catch (err) {
    console.info("File or directory does not yet exist on:\n", pathString);
  }

  return stats;
};

const prettyPrintFiles = (pathStrings) => {
  exec(
    `npx prettier --write ${pathStrings.join(" ")}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.info(`stdout: ${stdout}`);
    }
  );
};

const createOrUpdateFile = async (pathToFile, dataString = "", options) => {
  const o = Object.assign(
    {
      overwrite: false,
    },
    options
  );

  const stats = checkPathStats(pathToFile);

  if (!stats.exists) {
    await createPathIfMissing(stats.directory);
  } else if (!o.overwrite) {
    console.info("Prevented overwriting file:", stats.fileName);

    return;
  }

  await writeFile(pathToFile, dataString);

  prettyPrintFiles([pathToFile]);
};

const readLines = async (pathToFile, options) => {
  const file = await fsPromises.open(pathToFile);

  let lines = [];

  for await (const line of file.readLines(options)) {
    lines.push(line);
  }

  const result = lines.join("\n");

  file.close();

  return result;
};

const readFile = async (pathToFile) => {
  return runPromise((resolve, reject) => {
    fs.readFile(pathToFile, "utf8", (err, data) => {
      if (err) {
        console.error(err);

        return reject(err);
      }

      // console.info('Done reading from', pathToFile, data);

      resolve(data);
    });
  });
};

const readFilesRecursive = (directory, options) => {
  const { excludes } = Object.assign({ excludes: [] }, options);

  return runPromise((resolve, reject) => {
    recursiveReadDir(directory, excludes, (err, files) => {
      if (err) {
        console.error(err);

        return reject(err);
      }

      resolve(files);
    });
  });
};

const readFilesCurrent = (pathString, options) => {
  return runPromise((resolve, reject) => {
    fs.readdir(pathString, async (err, fileNames) => {
      const filteredFileNames = fileNames.filter(
        (fileName) => !options?.exclude?.includes(fileName)
      );

      if (err) {
        console.error(err);

        return reject(err);
      }

      if (options?.fileNamesOnly) {
        resolve(filteredFileNames);
      } else {
        const contentsArr = await asyncPromises(
          filteredFileNames,
          async (fileName) => {
            const content = await readFile(`${pathString}/${fileName}`);

            return { fileName, content };
          }
        );

        resolve(contentsArr);
      }
    });
  });
};

const writeFile = async (pathToFile, data) => {
  return runPromise((resolve, reject) => {
    fs.writeFile(pathToFile, data, (err) => {
      if (err) {
        console.error(err);

        return reject(err);
      }

      console.info("Done writing to", pathToFile);

      resolve(pathToFile);
    });
  });
};

const renameFile = async (pathToFile, newFileName) => {
  return runPromise((resolve, reject) => {
    const stats = checkPathStats(pathToFile);
    const newRelativePath = path.join(stats.directory, newFileName);

    if (!stats.exists) {
      const err = new Error("File does not exist:", pathToFile);

      console.error(err);

      return reject(err);
    }

    fs.rename(pathToFile, newRelativePath, (err) => {
      if (err) {
        console.error(err);

        return reject(err);
      }

      console.info(`Done renaming from "${stats.fileName}" to ${newFileName}`);

      resolve(pathToFile);
    });
  });
};

const searchFilesRecursive = async (directory, string, options) => {
  const files = await readFilesRecursive(directory, options);

  const results = await asyncPromises(files, async (pathToFile) => {
    const content = await readFile(pathToFile);
    const matches = getMatches(content, string);

    if (matches) {
      return pathToFile;
    }
  });

  return removeEmptyValues(results);
};

const searchFilesMapping = async (directory, options) => {
  const filePaths = await readFilesRecursive(directory, options);
  const sortedFilePaths = filePaths.sort();
  let resultsMap = {};

  await asyncPromises(sortedFilePaths, async (pathToFile) => {
    const info = checkPathStats(pathToFile);

    if (info.isFile) {
      const key = replace(info.directory, `${directory}/`);
      const arr = resultsMap[key] || [];

      resultsMap[key] = arr.concat(info.fileName);
    }
  });

  return resultsMap;
};

const readFileNamesWithoutExt = async (directory) => {
  const fileNames = await readFilesCurrent(directory, {
    fileNamesOnly: true,
    exclude: ["index.js"],
  });

  const fileNamesWithoutExt = flatten(
    fileNames.map((fileName) => fileName.split(".").slice(0, -1))
  );

  return fileNamesWithoutExt;
};

const replaceStringsInFile = async (
  pathToFile,
  stringMapping,
  { word = false } = {}
) => {
  const content = await readFile(pathToFile);

  const replaceFunc = !word ? replaceStrings : replaceWords;

  const updatedContent = replaceFunc(content, stringMapping);

  if (content !== updatedContent) {
    await writeFile(pathToFile, updatedContent);
  }

  return updatedContent;
};

const replaceStringsByFilename = async (directory, fileMapping, options) => {
  const files = await readFilesRecursive(directory, options);
  const transformedFiles = files.map(getPathInfo);
  const filesToUpdateNoExt = Object.keys(fileMapping);
  const filteredFiles = transformedFiles.filter((item) =>
    filesToUpdateNoExt.includes(item.name)
  );
  const filteredFilesMapping = convertArrayToObjectByKeys(filteredFiles, {
    labelKey: "name",
  });

  await asyncPromises(transformedFiles, (fileInfo) =>
    replaceStringsInFile(fileInfo.relativePath, fileMapping)
  );

  await asyncPromises(
    Object.entries(fileMapping),
    async ([oldName, newName]) => {
      const fileInfo = filteredFilesMapping[oldName];

      if (fileInfo) {
        const newFileName = `${newName}.${fileInfo.ext}`;

        await renameFile(fileInfo.relativePath, newFileName);
      }
    }
  );
};

module.exports = {
  getName,
  getFileName,
  getPathInfo,
  checkIfPathExists,
  createDirectory,
  checkPathStats,
  createPathIfMissing,
  createOrUpdateFile,
  readLines,
  readFile,
  readFilesRecursive,
  readFilesCurrent,
  writeFile,
  renameFile,
  searchFilesRecursive,
  searchFilesMapping,
  readFileNamesWithoutExt,
  replaceStringsInFile,
  replaceStringsByFilename,
};
