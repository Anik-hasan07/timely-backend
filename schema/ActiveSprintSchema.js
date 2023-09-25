const mongoose = require('mongoose');

const ActiveSprintSchema = mongoose.Schema(
	{
		sprintId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Sprint',
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
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

ActiveSprintSchema.virtual('sprint', {
	ref: 'Sprint',
	localField: 'sprintId',
	foreignField: '_id',
	justOne: true,
});

const ActiveSprint = mongoose.model('ActiveSprint', ActiveSprintSchema);

module.exports = ActiveSprint;
