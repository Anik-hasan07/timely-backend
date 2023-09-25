const mongoose = require('mongoose');
const User = require('../schema/userSchema');

exports.createUser = (data) => {
	const user = new User(data);
	return user.save();
};
exports.userExist = (userEmail) => User.findOne({ userEmail });
exports.userExistOrganization = (teamsUserId, orgId) =>
	User.findOne({ teamsUserId, organizationId: orgId });

exports.findUserById = (userId, projection = {}) =>
	User.findById(mongoose.Types.ObjectId(userId), projection);

exports.getOrganizationsUserCount = async (organizationId) => {
	const userByOrgId = await User.countDocuments({
		organizationId,
	});
	return userByOrgId;
};
exports.getAllUsers = async (organizationId) =>
	User.find(
		{ organizationId },
		{
			id: '$_id',
			teamsUserId: 1,
			userEmail: 1,
			userName: 1,
			userPhoto: 1,
			role: 1,
			_id: 0,
		}
	);

exports.getSingleUser = async (userId) =>
	User.findById(mongoose.Types.ObjectId(userId));

exports.deleteUserById = async (id) => {
	await User.findByIdAndDelete(id);
};
exports.changeUserRole = async (userId, role) =>
	User.findOneAndUpdate(
		{ _id: mongoose.Types.ObjectId(userId) },
		{
			$set: {
				role,
			},
		}
	);
