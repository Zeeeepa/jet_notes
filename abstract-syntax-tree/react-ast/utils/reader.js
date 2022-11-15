import { getPathInfo, readFile, readLines } from "../../../utils/file";

export const readSourceFile = async (pathToFile, dirName = __dirname) => {
  const info = getPathInfo(pathToFile, dirName);

  const code = await readFile(info.absolutePath);

  return code;
};

export const readSourceLines = async (
  pathToFile,
  options,
  dirName = __dirname
) => {
  const info = getPathInfo(pathToFile, dirName);

  const result = await readLines(info.absolutePath, options);

  return result;
};
