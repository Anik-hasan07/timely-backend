module.exports = {
	'*.{js,ts,tsx}': 'npm run check-lint',
	'*.{js,ts,tsx,css,json}': () => 'npm run check-format',
};
