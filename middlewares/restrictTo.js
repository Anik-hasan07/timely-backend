/* eslint-disable no-throw-literal */
const { errorResponseHandler } = require('../helpers');

const restrictTo =
	(...roles) =>
	async (ctx, next) => {
		try {
			if (!roles.includes(ctx.headers.userRole)) {
				throw {
					status: 403,
					message: 'Forbidden access',
				};
			}

			await next();
		} catch (err) {
			errorResponseHandler(ctx, err);
		}
	};

module.exports = restrictTo;
