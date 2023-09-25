const { deleteActiveSprintByProjectId } = require('../models/ActiveSprint');
const { deleteInvitationsByProjectId } = require('../models/Invitation');
const { deleteSprintsByProjectId } = require('../models/Sprint');
const { deleteTasksByProjectId } = require('../models/Task');
const { deleteUserProjectsByProjectId } = require('../models/userProject');

exports.processDeleteProject = async (projectId) => {
	await deleteTasksByProjectId(projectId);
	await deleteUserProjectsByProjectId(projectId);
	await deleteInvitationsByProjectId(projectId);
	await deleteSprintsByProjectId(projectId);
	await deleteActiveSprintByProjectId(projectId);
};
