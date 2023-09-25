const mongoose = require('mongoose');

const SprintSchema = mongoose.Schema(
	{
		sprintNumber: {
			type: Number,
			required: true,
		},
		organizationId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Organization',
		},
		projectId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Project',
		},
		startDate: {
			type: Date,
			default: Date.now,
		},
		endDate: {
			type: Date,
		},
		status: {
			type: String,
			required: true,
			enum: ['ACTIVE', 'RUNNING', 'CLOSED'],
		},
		closedOn: {
			type: Number,
		},
	},
	{
		timestamps: true,
	}
);

const Sprint = mongoose.model('Sprint', SprintSchema);

module.exports = Sprint;
