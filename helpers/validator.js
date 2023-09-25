const Validator = require('validatorjs');

// eslint-disable-next-line consistent-return
exports.validation = (input, rules) => {
	const validation = new Validator(input, rules);

	return validation.passes();
};
