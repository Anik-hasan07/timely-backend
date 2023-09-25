const Router = require('koa-router');
const health = require('./controllers/health');
const { createOrganization } = require('./controllers/organization');
const {
	createNewTask,
	getTaskDetail,
	assignTask,
	getTasksByUser,
	getTasksByProject,
	updateStatus,
	addTaskToSprint,
	removeTaskFromSprintByTaskId,
	deleteTask,
	updateTask,
	getTasksWorkedOn,
} = require('./controllers/task');

const {
	createUser,
	getUserDetails,
	getUsers,
	getUser,
	deleteSingleUser,
	changeUserRole,
} = require('./controllers/user');

const {
	startSprintById,
	endSprintById,
	getSprintTask,
	getSprintsByProject,
	generateSprint,
	getActiveSprint,
} = require('./controllers/sprint');
const {
	createProject,
	inviteMembers,
	getUsersProjects,
	updateInvitation,
	getOrganizationProjects,
	searchProjectMembers,
	getProjectUsers,
	deleteUserFromProject,
	updateProject,
	deleteProject,
	getProject,
	activeUserFromProject,
} = require('./controllers/projects');
const authenticate = require('./middlewares/authenticate');
const { getToken } = require('./controllers/getToken');
const restrictTo = require('./middlewares/restrictTo');

const routes = new Router();

routes.get('/health', health.check);
// Token
routes.get('/token', getToken);
// User
routes.post('/user', createUser);

routes.get('/users', authenticate, getUsers);

routes.get('/user/:id', authenticate, getUser);

routes.get('/user', authenticate, getUserDetails);
routes.delete(
	'/user/:userId',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	deleteSingleUser
);
routes.patch(
	'/users/:userId/role',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	changeUserRole
);
// Organization
routes.post('/organization', createOrganization);
routes.get(
	'/org/:orgId/project/:projectId/active-sprint',
	authenticate,
	getActiveSprint
);
routes.get('/org/projects', authenticate, getOrganizationProjects);

// project
routes.post(
	'/project',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	createProject
);

routes.patch(
	'/project/:projectId',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	updateProject
);
routes.post(
	'/project/:projectId/invite',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	inviteMembers
);
routes.delete(
	'/project/:projectId',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	deleteProject
);
routes.put('/project/:projectId/respond', authenticate, updateInvitation);
routes.get('/project/:projectId/task', authenticate, getTasksByProject);
routes.get('/project/:projectId/sprints', authenticate, getSprintsByProject);
routes.get('/project/:projectId/members', authenticate, searchProjectMembers);
routes.get('/project/:projectId/users', authenticate, getProjectUsers);
routes.delete(
	'/project/:projectId/:userId',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	deleteUserFromProject
);
routes.patch(
	'/project/:projectId/:userId',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	activeUserFromProject
);
routes.get('/projects', authenticate, getUsersProjects);
routes.get('/project/:id', authenticate, getProject);
// task
routes.get('/tasks/worked-on', authenticate, getTasksWorkedOn);
routes.get('/tasks/:taskId', authenticate, getTaskDetail);
routes.put('/tasks/:taskId/assignee', authenticate, assignTask);
routes.get('/tasks', authenticate, getTasksByUser);
routes.post('/tasks', authenticate, createNewTask);
routes.patch('/tasks/:taskId/status', updateStatus);
routes.delete('/task/:taskId', authenticate, restrictTo('Admin'), deleteTask);
routes.patch('/task/:taskId', authenticate, updateTask);
// sprint
routes.post(
	'/sprint',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	generateSprint
);
routes.patch(
	'/sprint/:sprintId/start',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	startSprintById
);
routes.patch(
	'/sprint/:sprintId/end',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	endSprintById
);
routes.get('/sprint/:sprintId/tasks', authenticate, getSprintTask);
routes.post(
	'/sprint/task',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	addTaskToSprint
);
routes.delete(
	'/sprint/task/:taskId',
	authenticate,
	restrictTo('SuperAdmin', 'Admin'),
	removeTaskFromSprintByTaskId
);

module.exports = routes;
