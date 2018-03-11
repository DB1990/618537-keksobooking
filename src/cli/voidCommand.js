const generate = require(`../generator/generate`);
const {questionPromise} = require(`../generator/questionPromise`);
const colors = require(`colors`);
const logger = require(`winston`);

module.exports = {
  name: `void`,
  description: `Show message for use generate`,
  execute() {
    questionPromise(`Hello User! Generate the data? y/n: `).then((answer) => {
      answer = answer.trim();
      if (answer === `y`) {
        return generate.execute();
      }
      throw new Error(`Cancel generate`);
    }).catch((err) => {
      logger.error(colors.red(err));
      process.exit(1);
    });
  }
};
