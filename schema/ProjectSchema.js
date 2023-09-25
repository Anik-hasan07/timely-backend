const mongoose = require('mongoose');
const { projectStatus } = require('../config/variables');

const ProjectSchema = new mongoose.Schema(
	{
		organizationId: {
			type: String,
			required: true,
		},
		projectName: {
			type: String,
			required: true,
		},
		boardType: {
			type: String,
			required: true,
			enum: ['scrum', 'kanban'],
		},
		projectPrefix: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: false,
			default: projectStatus.active,
			enum: Object.values(projectStatus),
		},
	},
	{
		timestamps: {
			createdAt: 'createdOn',
			updatedAt: 'updatedOn',
		},
	}
);

const Project = mongoose.model('Project', ProjectSchema);
module.exports = Project;
