/* eslint-disable no-underscore-dangle */
const { validate } = require('../helpers/index');
const { createSrpintRules } = require('../helpers/validationRules');
const {
	createSprint,
	createActiveSprint,
	getLatestSprint,
} = require('../models/Sprint');
const { sprintStatus } = require('../config/variables');

exports.createSprint = async (data) => {
	try {
		const {
			startDate,
			endDate,
			status,
			projectId,
			organizationId,
			makeActiveSprint,
		} = data;
		const fields = {
			startDate,
			endDate,
			status,
			projectId,
			organizationId,
		};
		validate(fields, createSrpintRules);

		const latestSprint = await getLatestSprint(projectId, organizationId);
		fields.sprintNumber = 1;
		if (latestSprint) {
			fields.sprintNumber = latestSprint.sprintNumber + 1;
		}
		if (makeActiveSprint) {
			fields.status = sprintStatus.active;
		}
		const sprint = await createSprint(fields);

		if (makeActiveSprint) {
			await createActiveSprint({
				sprintId: sprint._id,
				projectId,
				organizationId,
			});
		}
		return { sprintId: sprint?._id };
	} catch (error) {
		throw Object.assign(new Error(), { ...error, message: error.message });
	}
};
