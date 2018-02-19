const {generateEntity} = require(`./generateEntity`);
const fs = require(`fs`);
const util = require(`util`);
const writeFile = util.promisify(fs.writeFile);
const openFile = util.promisify(fs.open);
const {questionPromise} = require(`./questionPromise`);
const colors = require(`colors`);

const state = {
  numberOfEntity: null,
  fileName: null
};

const setState = (type, key, value) => {
  if (type === `number`) {
    const int = +value.trim();
    if (int === int && int > 0) {
      state[key] = int;
      return state;
    }
    throw new Error(`You did not enter a number > 0`);
  } else if (type === `string`) {
    if (value) {
      const string = value.trim();
      state[key] = string;
      return state;
    }
    throw new Error(`You did not enter a path`);
  }
  throw new Error(`I don't know this type`);
};

const openFileByName = (state) => {
  return openFile(`${process.cwd()}/${state.fileName}.json`, `wx`);
};

const createFile = (state) => {
  const data = generateEntity(state.numberOfEntity);
  const fileWriteOptions = {encoding: `utf-8`, mode: 0o644};
  return writeFile(`${process.cwd()}/${state.fileName}.json`, JSON.stringify(data), fileWriteOptions);
};

const answerWithFileOverwrite = (answer) => {
  answer = answer.trim();
  if (answer === `y`) {
    return createFile(state);
  }
  throw new Error(`Cancel generate`);
};

const generateSuccess = () => {
  console.log(colors.green(`Generate done`));
  process.exit(0);
};

const generateFail = (err) => {
  if (err.code === `EEXIST`) {
    return questionPromise(`${colors.yellow(`WARNING`)} The file exists. Is it overwritten? y/n: `)
        .then(answerWithFileOverwrite)
        .then(generateSuccess)
        .catch((error) => generateFail(error));
  }
  console.error(colors.red(err));
  process.exit(1);
  return 0;
};

module.exports = {
  name: `generate`,
  description: `Generates data for project`,
  execute() {
    questionPromise(`How many items you need to create? `)
        .then(setState.bind(null, `number`, `numberOfEntity`))
        .then(questionPromise.bind(null, `Write file's name: `))
        .then(setState.bind(null, `string`, `fileName`))
        .then(openFileByName.bind(null, state))
        .then(createFile.bind(null, state))
        .then(generateSuccess)
        .catch(generateFail);
  }
};