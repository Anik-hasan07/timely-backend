const requestId = require('./lib/requestId');
const errorResponseHandler = require('./lib/errorResponseHandler');
const { validate } = require('./lib/validator/validate');

module.exports = {
	requestId,
	errorResponseHandler,
	validate,
};
