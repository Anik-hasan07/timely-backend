/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const variables = require('../config/variables');
const { validate, errorResponseHandler } = require('../helpers');
const {
	createUserRules,
	changeUserRoleRules,
} = require('../helpers/validationRules');
const {
	createUser,
	findUserById,
	userExist,
	getAllUsers,
	getSingleUser,
	deleteUserById,
	changeUserRole,
} = require('../models/User');

exports.createUser = async (ctx) => {
	try {
		const {
			teamsUserId,
			userName,
			userEmail,
			userPhoto,
			role,
			organizationId,
		} = ctx.request.body;
		validate(
			{
				userEmail,
				teamsUserId,
				userName,
				userPhoto,
				role,
				organizationId,
			},
			createUserRules
		);
		const isUserExist = await userExist(userEmail);
		if (isUserExist) {
			throw Object.assign(new Error(), {
				status: 400,
				message: 'User already exists',
			});
		}
		const result = await createUser({
			userName,
			userEmail,
			userPhoto,
			role,
			organizationId,
			teamsUserId,
		});
		const token = jwt.sign(
			{ userId: result._id, userEmail, organizationId },
			variables.jwtSecretKey,
			{
				expiresIn: '180d',
			}
		);

		ctx.response.ok({ token }, 'User created successfully');
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};

exports.getUserDetails = async (ctx) => {
	try {
		const { userId } = ctx.headers;
		if (!userId) {
			return ctx.response.unauthorized({}, 'Invalid user Id');
		}
		const projectionValue = {
			_id: 0,
			userId: '$_id',
			teamsUserId: 1,
			userName: 1,
			userEmail: 1,
			userPhoto: 1,
			role: 1,
			organizationId: 1,
		};
		const userDetails = await findUserById(userId, projectionValue);
		return ctx.response.ok(userDetails, 'User info fetched successfully');
	} catch (error) {
		return errorResponseHandler(ctx, error);
	}
};
// eslint-disable-next-line consistent-return
exports.getUsers = async (ctx) => {
	try {
		const { organizationId } = ctx.headers;
		const users = await getAllUsers(organizationId);
		if (!users) {
			ctx.response.ok({}, 'user not available');
		}
		ctx.response.ok({ users }, 'Users get successfully');
	} catch (error) {
		return errorResponseHandler(ctx, error);
	}
};
// eslint-disable-next-line consistent-return
exports.getUser = async (ctx) => {
	try {
		const userId = ctx.params;
		const user = await getSingleUser(userId);
		if (user) {
			return ctx.response.ok({ user }, 'User get Successfully');
		}
		return ctx.response.ok({}, 'user not available');
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};
exports.deleteSingleUser = async (ctx) => {
	try {
		const { userId } = ctx.params;
		const user = await getSingleUser(userId);
		if (!user) {
			return ctx.response.unauthorized({}, 'Invalid user Id');
		}
		await deleteUserById(userId);
		return ctx.response.ok({}, 'User deleted successfully');
	} catch (error) {
		return errorResponseHandler(ctx, error);
	}
};
// eslint-disable-next-line consistent-return
exports.changeUserRole = async (ctx) => {
	try {
		const { role } = ctx.request.body;
		const { userId } = ctx.params;
		// eslint-disable-next-line no-undef
		validate({ role }, changeUserRoleRules);
		const userDoseExist = await getSingleUser(userId);
		if (userDoseExist) {
			await changeUserRole(userId, role);

			return ctx.response.ok({}, 'role updated successfully');
		}
		throw Object.assign(new Error(), {
			status: 404,
			message: 'User not found!',
		});
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};
