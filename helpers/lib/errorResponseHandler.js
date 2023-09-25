// const errorCodes = require('./errorCodes');

function getErrData(err) {
	if (err) {
		if (err.response && err.response.data) {
			return err.response.data.data || err.response.data;
		}
		if (err.data) {
			return err.data.errors || err.data;
		}
		if (err.errors) {
			return err.errors;
		}
	}
	return {};
}
function getErrError(err) {
	if (err) {
		let errorData = {};
		if (err.error) {
			errorData = err.error;
		} else if (err.response && err.response.error) {
			errorData = err.response.error;
		} else if (err.message) {
			errorData = err.message;
		}

		// if (errorCodes[errorData.code]) {
		// 	errorData = { ...errorData, ...errorCodes[errorData.code] };
		// }

		return errorData;
	}
	return {};
}

const errorResponseHandler = (ctx, err) => {
	const {
		status,
		title = null,
		request = {},
		statusText = null,
		message,
	} = err.response ? err.response : err;
	const instance =
		request && request.path !== undefined ? request.path : ctx.request.url;
	let errorTitle;

	const data = getErrData(err);
	const error = getErrError(err);
	// data.status ? delete data.status : null;
	// data.message ? delete data.message : null;

	switch (status) {
		case 400:
			ctx.response.badRequest(
				{ title: message, instance, ...data },
				message || error.message,
				error
			);
			break;
		case 401:
			ctx.response.unauthorized(
				{
					title: title || statusText || 'Authentication Failed',
					instance,
					...data,
				},
				message || error.message,
				error
			);
			break;
		case 403:
			ctx.response.forbidden(
				{
					title: message || title,
					instance,
				},
				error.message || 'Forbidden',
				error
			);
			break;
		case 404:
			ctx.response.notFound(
				{
					title: title || statusText,
					instance,
					...data,
				},
				error.message || 'Resource not found',
				error
			);
			break;
		case 409:
			ctx.response.conflict(
				{
					title: title || statusText,
					instance,
					...data,
				},
				message || error.message,
				error
			);
			break;
		case 503:
			errorTitle =
				title ||
				statusText ||
				(err.source !== undefined
					? `${err.source} unavailable`
					: 'Service unavailable');
			ctx.response.serviceUnavailable(503, errorTitle, error);
			break;
		default:
			errorTitle =
				title ||
				statusText ||
				(err.source !== undefined
					? `${err.source} Internal Error`
					: 'Internal Error');
			ctx.response.internalServerError(
				status,
				{
					title: errorTitle,
					instance,
				},
				error
			);
	}
};

module.exports = errorResponseHandler;
