const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
	foreignKey: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'foreign_table',
	},
	regularField: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
});

module.exports = TestSchema;
