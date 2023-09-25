/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const { organizationExist, create } = require('../models/Organization');
const {
	createUser,
	getOrganizationsUserCount,
	userExistOrganization,
} = require('../models/User');
const variables = require('../config/variables');
const { validate, errorResponseHandler } = require('../helpers');
const { getTokenRules } = require('../helpers/validationRules');
const { assignToProject } = require('../models/userProject');
const {
	getUserInvitationFromDb,
	deleteInvitationFromDb,
} = require('../models/Invitation');

const handleInvitation = async (params) => {
	const { userEmail, organizationId, projectId, userId } = params;
	const userInvitation = await getUserInvitationFromDb(
		userEmail,
		organizationId,
		projectId
	);

	if (userInvitation?.status === variables.invitationStatus.pending) {
		await assignToProject({
			userId,
			organizationId,
			projectId,
		});

		await deleteInvitationFromDb(userInvitation._id);
	}
};

exports.getToken = async (ctx) => {
	try {
		const {
			userId: teamsUserId,
			userName,
			userEmail,
			orgId: teamsOrgId,
			orgName,
			projectId,
		} = ctx.request.query;
		validate(
			{
				userEmail,
				teamsUserId,
				userName,
				teamsOrgId,
				orgName,
				projectId,
			},
			getTokenRules
		);
		let user = null;
		let org = null;

		org = await organizationExist(teamsOrgId);

		if (!org) {
			org = await create(orgName, teamsOrgId);
		}

		user = await userExistOrganization(teamsUserId, org._id);

		if (!user) {
			const userCount = await getOrganizationsUserCount(org._id);
			user = await createUser({
				userName,
				userEmail,
				role: userCount > 0 ? 'User' : 'SuperAdmin',
				organizationId: org._id,
				teamsUserId,
			});
		}

		const params = {
			userEmail,
			organizationId: org._id,
			projectId,
			userId: user._id,
		};
		await handleInvitation(params);

		const token = jwt.sign(
			{
				userId: user._id,
				organizationId: org._id,
				role: user.role,
			},
			variables.jwtSecretKey,
			{
				expiresIn: '30d',
			}
		);

		ctx.response.ok({ token }, 'Generate user token successfully');
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};
