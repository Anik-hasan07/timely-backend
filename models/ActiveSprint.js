const ActiveSprint = require('../schema/ActiveSprintSchema');

exports.deleteActiveSprintByProjectId = async (projectId) =>
	ActiveSprint.deleteMany({ projectId });
