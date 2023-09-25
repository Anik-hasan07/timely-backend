/* eslint-disable default-param-last */

const statusCodes = require('./statusCodes');

/**
 *
 * @param {Number} code
 * @param {string|null} message
 * @returns {Object}
 */
function getErrorBlock(code, message) {
	const errorObj = {};
	errorObj.code = code;
	Object.assign(errorObj, code);
	if (message) {
		errorObj.message = message;
	}
	return errorObj;
}

function responseHandler() {
	return async (ctx, next) => {
		ctx.response.statusCodes = statusCodes;
		ctx.statusCodes = ctx.response.statusCodes;

		ctx.response.textOk = (text) => {
			ctx.status = statusCodes.OK;
			ctx.body = text;
		};

		ctx.response.success = (data = null, message = null, error = {}) => {
			ctx.status = ctx.status < 400 ? ctx.status : statusCodes.OK;
			ctx.body = { status: 'success', data, error, message };
		};

		ctx.response.fail = (data = null, message = null, error = {}) => {
			ctx.status =
				ctx.status >= 400 && ctx.status < 500
					? ctx.status
					: statusCodes.BAD_REQUEST;
			ctx.body = { status: 'fail', data, error, message };
		};

		ctx.response.error = (code = null, message = null, error = {}) => {
			ctx.status =
				ctx.status < 500 ? statusCodes.INTERNAL_SERVER_ERROR : ctx.status;
			ctx.body = { status: 'error', code, error, message };
		};

		ctx.response.throw = (errConstructor, msg, code = 400) => {
			throw Object.assign(errConstructor, {
				status: code,
				message: msg,
			});
		};

		/**
		 *
		 * @param {Object|null} data
		 * @param {string|null} message
		 * @param {Number} errorCode
		 * @param {Object} [errData]
		 */
		// eslint-disable-next-line default-param-last
		ctx.response.okFail = (
			data = null,
			message = null,
			errorCode,
			errData = null
		) => {
			ctx.status = statusCodes.OK;

			const error = getErrorBlock(errorCode, message);

			if (errData) {
				error.data = errData;
			}
			ctx.response.success(data, message || error.message, error);
		};

		ctx.response.ok = (data, message) => {
			ctx.status = statusCodes.OK;
			ctx.response.success(data, message);
		};

		ctx.response.created = (data, message) => {
			ctx.status = statusCodes.CREATED;
			ctx.response.success(data, message);
		};

		ctx.response.accepted = (data, message) => {
			ctx.status = statusCodes.ACCEPTED;
			ctx.response.success(data, message);
		};

		ctx.response.noContent = (data, message) => {
			ctx.status = statusCodes.NO_CONTENT;
			ctx.response.success(data, message);
		};

		ctx.response.badRequest = (data, message, error) => {
			ctx.status = statusCodes.BAD_REQUEST;
			ctx.response.fail(data, message, error);
		};

		ctx.response.unauthorized = (data, message, error) => {
			ctx.status = statusCodes.UNAUTHORIZED;
			ctx.response.fail(data, message, error);
		};

		ctx.response.forbidden = (data, message, error) => {
			ctx.status = statusCodes.FORBIDDEN;
			ctx.response.fail(data, message, error);
		};

		ctx.response.notFound = (data, message, error) => {
			ctx.status = statusCodes.NOT_FOUND;
			ctx.response.fail(data, message, error);
		};

		ctx.response.internalServerError = (code, message, error) => {
			ctx.status = statusCodes.INTERNAL_SERVER_ERROR;
			ctx.response.error(code, message, error);
		};

		ctx.response.notImplemented = (code, message, error) => {
			ctx.status = statusCodes.NOT_IMPLEMENTED;
			ctx.response.error(code, message, error);
		};

		ctx.response.conflict = (data, message, error) => {
			ctx.status = statusCodes.CONFLICT;
			ctx.response.fail(data, message, error);
		};

		ctx.response.serviceUnavailable = (code, message, error) => {
			ctx.status = statusCodes.SERVICE_UNAVAILABLE;
			ctx.response.error(code, message, error);
		};

		await next();
	};
}

module.exports = responseHandler;
