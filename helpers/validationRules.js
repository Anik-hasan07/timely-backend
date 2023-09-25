const signUpRules = {
	email: 'required|email',
	// other rules in validator.js format
};
const organizationNameRules = {
	organizationName: 'required|string|min:3',
	teamsOrgId: 'required|string',
};
const createProjectRules = {
	projectName: 'required|string|min:3',
	boardType: 'required|in:kanban,scrum',
	projectPrefix: 'required|string',
};
const updateProjectRules = {
	projectName: 'string|min:3',
	boardType: 'in:kanban,scrum',
	projectPrefix: 'string',
};
const assignTaskRules = {
	taskId: 'required',
	assigneeId: 'required',
};
const createUserRules = {
	teamsUserId: 'required|string',
	userName: 'required|string|min:3',
	userEmail: 'required|email',
	userPhoto: 'required|string',
	role: 'required|in:admin,user,super-admin',
	organizationId: 'required|string',
};
const userProjectRules = {
	userId: 'required|string',
	projectId: 'required|string',
	organizationId: 'required|string',
};
const inviteMemberRules = {
	projectId: 'required|string',
	emails: 'required|array',
	'emails.*': 'required|email',
};
const validResponseTypes = ['accept', 'reject'];
const updateInvitationRules = {
	invitationId: 'required|string',
	response: `required|in:${validResponseTypes}`,
};

const createTaskRules = {
	taskName: 'required|string|min:3',
	projectId: 'required|string',
	organizationId: 'required|string',
	reporterId: 'string',
	assigneeId: 'string',
	taskDetails: 'string',
	storyPoint: 'numeric',
	dueDate: 'date',
	priority: 'string',
	sprintId: 'string',
	type: 'string|in:story,task,bug',
};

const updateTaskRules = {
	reporterId: 'string',
	assigneeId: 'string',
	taskDetails: 'string',
	storyPoint: 'numeric',
	dueDate: 'date',
	priority: 'string',
	sprintId: 'string',
	type: 'string|in:story,task,bug',
	position: 'string',
};

const getTokenRules = {
	teamsUserId: 'required|string',
	userName: 'required|string|min:3',
	userEmail: 'required|email',
	teamsOrgId: 'required|string',
	orgName: 'required|string|min:3',
	projectId: 'string|min:3',
};
const searchTaskRules = {
	keyword: 'required|string|min:3',
};

const createSrpintRules = {
	startDate: 'date',
	endDate: 'date',
	status: 'in:ACTIVE,RUNNING,CLOSED',
	organizationId: 'required',
	projectId: 'required',
};
const changeUserRoleRules = {
	role: 'in:Admin,User',
};
const startSprintRules = {
	sprintId: 'required|string',
	startDate: 'required|string',
	endDate: 'required|string',
};

module.exports = {
	signUpRules,
	organizationNameRules,
	createProjectRules,
	updateProjectRules,
	assignTaskRules,
	createTaskRules,
	createUserRules,
	updateTaskRules,
	userProjectRules,
	inviteMemberRules,
	updateInvitationRules,
	searchTaskRules,
	createSrpintRules,
	getTokenRules,
	changeUserRoleRules,
	startSprintRules,
};
