const { default: mongoose } = require('mongoose');
const Invitation = require('../schema/InvitationSchema');

exports.createInvitation = async (data) => {
	const existingInvitation = await Invitation.find({
		userEmail: data.userEmail,
		projectId: data.projectId,
	});
	if (existingInvitation.length) {
		return;
	}
	const fields = {
		userEmail: data.userEmail,
		organizationId: mongoose.Types.ObjectId(data.organizationId),
		projectId: mongoose.Types.ObjectId(data.projectId),
		status: 'pending',
	};
	const invitation = new Invitation(fields);
	// eslint-disable-next-line consistent-return
	return invitation.save();
};

exports.getInvitationById = async (invitationId) => {
	const id = mongoose.Types.ObjectId(invitationId);
	const invitation = await Invitation.findOne({ _id: id });
	return invitation;
};

exports.updateInvitationResponse = async (invitationId, response) => {
	const id = mongoose.Types.ObjectId(invitationId);
	const data = await Invitation.findOneAndUpdate(
		{ _id: id },
		{ status: response }
	);
	return data;
};

exports.getUserInvitationFromDb = async (
	userEmail,
	organizationId,
	projectId
) => Invitation.findOne({ userEmail, organizationId, projectId });

exports.deleteInvitationFromDb = async (invitationId) => {
	await Invitation.deleteOne({ _id: invitationId });
};

exports.deleteInvitationsByProjectId = async (projectId) =>
	Invitation.deleteMany({ projectId: mongoose.Types.ObjectId(projectId) });
