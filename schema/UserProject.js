const mongoose = require('mongoose');

const UserProjectSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		organizationId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Organization',
			required: true,
		},
		projectId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Project',
			required: true,
		},
		status: {
			type: String,
		},
	},
	{
		timestamps: {
			createdAt: 'createdOn',
			updatedAt: 'updatedOn',
		},
	}
);

const UserProject = mongoose.model('User-projects', UserProjectSchema);
module.exports = UserProject;
