// eslint-disable-next-line consistent-return
exports.getMessage = (code) => {
	switch (code) {
		case 11000:
			return 'DUPLICATE';
		default:
			break;
	}
};
