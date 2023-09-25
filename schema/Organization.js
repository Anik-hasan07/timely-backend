const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const OrganizationSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		teamsOrgId: {
			type: String,
			required: true,
			unique: true,
		},
	},
	{
		timestamps: {
			createdAt: 'createdOn',
			updatedAt: 'updatedOn',
		},
	}
);

const Organization = mongoose.model('organization', OrganizationSchema);
module.exports = Organization;
