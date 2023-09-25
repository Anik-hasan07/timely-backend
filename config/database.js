const mongoose = require('mongoose');
const variables = require('./variables');
const logger = require('../logger');

mongoose.set('strictQuery', true);
const initDB = () => {
	mongoose.connect(variables.mongoDbUrl, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	const db = mongoose.connection;
	db.on('error', (err) => {
		logger.error(`Connection error: ${err}`);
	});
	db.once('open', () => {
		logger.info('Connected to MongoDB');
	});
};

module.exports = initDB;
