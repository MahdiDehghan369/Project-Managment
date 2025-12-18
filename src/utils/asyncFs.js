const fs = require("fs/promises");
const createError = require("./createError");

const existsAsync = async (path) => {
  try {
    await fs.access(path); 
    return true;
  } catch {
    return false;
  }
};

const rmAsync = async (path) => {
  try {
    if (await existsAsync(path)) {
      await fs.rm(path, { recursive: true, force: true });
    }
  } catch (error) {
    throw createError(500, error.message);
  }
};

const mkdirAsync = async (path) => {
  try {
    if (!(await existsAsync(path))) {
      await fs.mkdir(path, { recursive: true });
    }
  } catch (error) {
    throw createError(500, error.message);
  }
};

const writeFileAsync = async(path , content) => {
    try {
        await fs.writeFile(path , content)
    } catch (error) {
        throw createError(error.statusCode || 500 , error.message)
    }
}

const unlinkAsync = async (path) => {
  try {
    await fs.unlink(path);
  } catch (error) {
    throw createError(error.statusCode || 500, error.message);
  }
};

module.exports = {
  existsAsync,
  rmAsync,
  mkdirAsync,
  writeFileAsync,
  unlinkAsync,
};
