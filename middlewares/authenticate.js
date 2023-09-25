/* eslint-disable no-throw-literal */
const jwt = require('jsonwebtoken');
const variables = require('../config/variables');
const { errorResponseHandler } = require('../helpers');

const authenticate = async (ctx, next) => {
	try {
		const authHeader = ctx.headers.authorization;

		if (!authHeader) {
			throw {
				status: 401,
				message: 'Unauthorized access',
			};
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			throw {
				status: 401,
				message: 'Unauthorized access',
			};
		}

		const userData = jwt.verify(token, variables.jwtSecretKey);

		if (!userData.userId || !userData.organizationId) {
			throw {
				status: 401,
				message: 'Unauthorized access',
			};
		}
		ctx.headers.userId = userData.userId;
		ctx.headers.userRole = userData.role;
		ctx.headers.organizationId = userData.organizationId;
		await next();
	} catch (err) {
		errorResponseHandler(ctx, err);
	}
};

module.exports = authenticate;
