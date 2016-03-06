var errorOccurred = false; //eslint-disable-line no-var

/**
 * Logs error into variable
 * @returns {void}
 */
const watchErrorHandler = () => {
  console.log("Error occurred... "); //eslint-disable-line no-console
  errorOccurred = true;
};

const isError = () => {
  return errorOccurred;
};

module.exports.watchErrorHandler = watchErrorHandler;
module.exports.isError = isError;

