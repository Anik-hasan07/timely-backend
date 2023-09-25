const { default: mongoose } = require('mongoose');
const UserProject = require('../schema/UserProject');
const { projectStatus, invitationStatus } = require('../config/variables');
const Invitation = require('../schema/InvitationSchema');

exports.assignToProject = ({ userId, organizationId, projectId }) => {
	const userProject = new UserProject({
		userId,
		organizationId,
		projectId,
	});
	return userProject.save();
};
exports.getUserProjects = async (userData) => {
	try {
		const projects = await UserProject.aggregate([
			{
				$match: {
					userId: mongoose.Types.ObjectId(userData.userId),
					organizationId: mongoose.Types.ObjectId(userData.organizationId),
				},
			},
			{
				$lookup: {
					from: 'projects',
					localField: 'projectId',
					foreignField: '_id',
					as: 'populatedProject',
				},
			},
			{
				$match: {
					populatedProject: { $ne: [] },
					'populatedProject.status': { $ne: projectStatus.deleted },
				},
			},
			{
				$project: {
					_id: 1,
					userId: 1,
					organizationId: 1,
					projectId: { $arrayElemAt: ['$populatedProject', 0] },
					status: 1,
				},
			},
			{
				$addFields: {
					'projectId.userStatus': '$status',
				},
			},
			{
				$project: {
					_id: 1,
					userId: 1,
					organizationId: 1,
					projectId: 1,
				},
			},
		]);

		return projects;
	} catch (error) {
		console.error('Error in getUserProjects:', error);
		throw error;
	}
};

exports.getProjectMembersByProjectId = async (projectId) =>
	UserProject.aggregate([
		{ $match: { projectId } },
		{ $addFields: { userObjectId: { $toObjectId: '$userId' } } },
		{
			$lookup: {
				from: 'users',
				localField: 'userObjectId',
				foreignField: '_id',
				as: 'userData',
			},
		},
	])
		.project({
			_id: 0,
			user: { $arrayElemAt: ['$userData', 0] },
		})
		.project({
			userId: 1,
			'user._id': 1,
			'user.userName': 1,
			'user.userPhoto': 1,
		});

exports.getProjectUsersBy = async (projectId) => {
	const projectUsers = await UserProject.aggregate([
		{ $match: { projectId: mongoose.Types.ObjectId(projectId) } },
		{ $addFields: { userObjectId: { $toObjectId: '$userId' } } },

		{
			$lookup: {
				from: 'users',
				localField: 'userObjectId',
				foreignField: '_id',
				as: 'projectUsers',
			},
		},
	])

		.project({
			_id: 0,
			user: { $arrayElemAt: ['$projectUsers', 0] },
			status: 1,
		})
		.project({
			userId: 1,
			'user._id': 1,
			'user.userName': 1,
			'user.userEmail': 1,
			'user.role': 1,
			'user.userPhoto': 1,
			'user.status': '$status',
		});

	const invitedUsers = await Invitation.aggregate([
		{
			$match: { projectId: mongoose.Types.ObjectId(projectId) },
		},
		{
			$lookup: {
				from: 'users',
				localField: 'userEmail',
				foreignField: 'userEmail',
				as: 'projectUsers',
			},
		},
		{
			$project: {
				userId: {
					$ifNull: [{ $arrayElemAt: ['$projectUsers._id', 0] }, '$_id'],
				},
				'user._id': {
					$ifNull: [{ $arrayElemAt: ['$projectUsers._id', 0] }, '$_id'],
				},
				'user.userName': {
					$ifNull: [
						{ $arrayElemAt: ['$projectUsers.userName', 0] },
						'$userEmail',
					],
				},
				'user.userEmail': {
					$ifNull: [
						{ $arrayElemAt: ['$projectUsers.userEmail', 0] },
						'$userEmail',
					],
				},
				'user.role': {
					$ifNull: [{ $arrayElemAt: ['$projectUsers.role', 0] }, undefined],
				},
				'user.userPhoto': {
					$ifNull: [
						{ $arrayElemAt: ['$projectUsers.userPhoto', 0] },
						undefined,
					],
				},
				'user.status': invitationStatus.pending,
			},
		},
	]);

	return [...projectUsers, ...invitedUsers];
};
exports.removeUserFromProject = async (projectId, userId) => {
	const hasProjectWithUserExists = await UserProject.countDocuments({
		projectId,
		userId,
	});

	if (hasProjectWithUserExists) {
		const data = await UserProject.updateOne(
			{ projectId: projectId, userId: userId },
			{ $set: { status: 'INACTIVE' } },
			{ new: true }
		);

		return data;
	}

	throw new Error("User doesn't exist in the current project!");
};
exports.activeUserFromProject = async (projectId, userId, status) => {
	const hasProjectWithUserExists = await UserProject.countDocuments({
		projectId,
		userId,
	});

	if (hasProjectWithUserExists) {
		const data = await UserProject.updateOne(
			{ projectId: projectId, userId: userId },
			{ $set: { status: status } },
			{ new: true }
		);

		return data;
	}

	throw new Error("User doesn't exist in the current project!");
};

exports.deleteUserProjectsByProjectId = (projectId) =>
	UserProject.deleteMany({ projectId: mongoose.Types.ObjectId(projectId) });
