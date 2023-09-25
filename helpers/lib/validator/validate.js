/* eslint-disable no-throw-literal */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
const Validator = require('validatorjs');

const validateAge = (dob) => {
	const minAge = 18;
	const maxAge = 100;
	const [year, month, day] = String(dob).split('-');
	const currentDate = new Date();
	const dateOfBirth = new Date(year, month - 1, day);
	const minDate = new Date(dateOfBirth.getFullYear() + minAge, month - 1, day);
	const maxDate = new Date(dateOfBirth.getFullYear() + maxAge, month - 1, day);
	return currentDate - minDate > 0 && currentDate <= maxDate;
};

Validator.register(
	'decimal',
	(value) => {
		const val = String(value);
		return val.match(/^\d+(\.\d{1,})?$/);
	},
	'The :attribute is not a positive decimal number.'
);

Validator.register(
	'date-of-birth',
	(value) => {
		if (!value.match(/^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/)) {
			return false;
		}
		return validateAge(value);
	},
	'The :attribute should be a valid date in ISO format YYYY-MM-DD and age should be between 18-100 years'
);
Validator.register(
	'latin',
	(value) => value.match(/^([A-Za-z\s]*)$/g),
	'The :attribute should only include latin letters or/and spaces'
);

Validator.register(
	'address-rule',
	(value) => {
		value = value.replace(/\s\s+/g, ' '); // remove multiple space
		return !value.match(
			/^ *(pmb|post office box|(box[-. ]*?\d+)|(.*p[ .]? ?(o|0)[-. ]*?(box|b|(#|num)?\d+))|(p(ost)? *(o(ffice)?)? *(box|b)? *\d+)|(p *-?\/?(o)? *-* *?box)|(box|b) *(no|#)? *\d+|(number|#) *\d+)/i
		);
	},
	"We can't accept a PO Box as your registered address. Please provide your complete residential or business street address."
);

Validator.register(
	'alpha_dash_space_only',
	(value) => String(value).match(/^[a-zA-Z -]*$/),
	':attribute should be alphabet, dash and space only.'
);

Validator.register(
	'names-regex-rule',
	(value) => {
		if (value.match(/[~`!@#$%^&*()_={}[\]:;,.<>+\\/?-]/) || value.match(/\d/)) {
			return false;
		}
		return true;
	},
	"The :attribute can't include number or special characters"
);

exports.validate = (data, rules, messages) => {
	const validation = new Validator(data, rules, messages);

	if (validation.fails()) {
		throw {
			// status: 400,
			// data: {
			// 	errors: {
			// 		'invalid-params': validation.errors.all(),
			// 	},
			// },
			error: {
				code: 400,
				data: {
					'invalid-params': validation.errors.all(),
				},
			},
		};
	}

	return validation.passes();
};

exports.specialCharacterCheck = (data) => {
	if (data.match(/[~`!@#$%^&*()_={}[\]:;,.<>+\\/?-]/)) {
		return true;
	}
	return false;
};
exports.latinNameRules = (firstName, lastName) => {
	let rules = `max:50|latin`;
	if (
		(firstName && String(firstName).match(/([^\x20-\x7F]+)/)) ||
		(lastName && String(lastName).match(/([^\x20-\x7F]+)/))
	) {
		rules += `|required`;
	}

	return rules;
};
