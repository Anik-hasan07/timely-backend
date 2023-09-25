exports.check = async (ctx) => {
	// eslint-disable-next-line no-useless-catch
	try {
		ctx.status = 200;
		ctx.body = { message: 'Success' };
	} catch (error) {
		throw error;
	}
};
