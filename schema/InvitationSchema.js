const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema(
	{
		userEmail: {
			type: String,
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
			required: true,
			enum: ['pending', 'accepted', 'rejected'],
		},
	},
	{
		timestamps: {
			createdAt: 'createdOn',
			updatedAt: 'updatedOn',
		},
	}
);

const Invitation = mongoose.model('Invitation', InvitationSchema);
module.exports = Invitation;
