/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-const */
const { default: mongoose } = require('mongoose');
const { errorResponseHandler, validate } = require('../helpers');
const {
	assignTaskRules,
	searchTaskRules,
	updateTaskRules,
} = require('../helpers/validationRules');

const { createTaskRules } = require('../helpers/validationRules');
const logger = require('../logger');
const { findUserById, getSingleUser } = require('../models/User');
const {
	createTask,
	checkIfTaskExists,
	updateAssignee,
	getUsersAssignedTasks,
	getTask,
	update,
	searchTaskByProjectId,
	getTotalTaskByProjectId,
	findTasksByProjectId,
	updateTaskStatus,
	removeTaskFromSprintBy,
	deleteTaskById,
	updateTaskById,
	getWorkedOnTasks,
} = require('../models/Task');
const { findProjectById } = require('../models/Project');
const {
	sendEmailToAssignee,
	sendEmailToReporter,
} = require('../Adapters/Email');

const formatTaskData = (taskData) =>
	taskData.map((task) => ({
		taskId: task._id,
		type: task.type,
		title: task.taskName,
		status: task.status,
		assignee: task.assigneeName,
		storyPoint: task.storyPoint,
		taskNumber: task.taskNumber,
		position: task.position,
	}));

const assignTask = async (ctx) => {
	try {
		const { taskId } = ctx.params;
		const { assigneeId } = ctx.request.body;
		validate(
			{
				taskId,
				assigneeId,
			},
			assignTaskRules
		);

		const assignee = await findUserById(assigneeId);

		const data = {
			assigneeId: mongoose.Types.ObjectId(assigneeId),
			assigneeName: assignee.userName,
		};

		await updateAssignee(taskId, data);

		ctx.response.ok({}, 'Task updated successfully');
	} catch (err) {
		errorResponseHandler(ctx, err);
	}
};

const createNewTask = async (ctx) => {
	try {
		let {
			taskName,
			projectId,
			reporterId,
			assigneeId,
			taskDetails,
			priority,
			storyPoint,
			type,
			sprintId,
			dueDate,
		} = ctx.request.body;
		const { organizationId, userId } = ctx.headers;
		const taskType = type || 'task';

		validate(
			{
				taskName,
				projectId,
				organizationId,
				reporterId,
				taskDetails,
				storyPoint,
				dueDate,
				type: taskType,
				priority,
				sprintId,
			},
			createTaskRules
		);

		const reporterName = (await findUserById(reporterId))?.userName;
		const createdById = userId;
		const createdBy = await findUserById(createdById);

		const createdByName = createdBy.userName;
		let assigneeName = '';

		if (assigneeId) {
			assigneeName = (await findUserById(assigneeId))?.userName;
		}
		const { projectName, projectPrefix } = await findProjectById(projectId);
		const totalTaskCount = (await getTotalTaskByProjectId(projectId)).length;

		const count = totalTaskCount === 0 ? 1 : totalTaskCount + 1;
		const taskNumber = `${projectPrefix}-${count}`;

		if (!projectName) {
			throw new Error(`project with ${projectId} not found!`);
		}
		if (!createdByName) {
			throw new Error(`creator::user with ${createdById} not found!`);
		}

		const doesTaskExist = await checkIfTaskExists(taskName, projectId);

		if (doesTaskExist) {
			logger.error(`Task with ${taskName} already exist`);
			ctx.response.error(500, 'Task already exists for given payload!');
			return;
		}

		const taskCreationJob = await createTask({
			taskName,
			projectId,
			projectName,
			organizationId,
			reporterId,
			reporterName,
			assigneeId,
			assigneeName,
			taskDetails,
			storyPoint,
			type: taskType,
			taskNumber,
			dueDate,
			createdById,
			createdByName,
			priority,
			sprintId,
		});
		const taskId = taskCreationJob._id;

		ctx.response.ok(
			{
				taskId,
			},
			'Task created successfully'
		);
	} catch (error) {
		logger.error(`error occured during task creation ${error}`);
		errorResponseHandler(ctx, error);
	}
};

const getTasksWorkedOn = async (ctx) => {
	try {
	  const { userId } = ctx.headers;
	  const workedOnTasks = await getWorkedOnTasks(userId);
	  if (!workedOnTasks) {
		throw new Error(`There is no task here.`);
	}
	  ctx.response.ok(
		{
			data:workedOnTasks,
		},
		'List of the tasks you worked on'
	);
	} catch (error) {
	  errorResponseHandler(ctx, error);
	}
  };

const getTaskDetail = async (ctx) => {
	try {
		const { taskId } = ctx.params;
		let taskDetail = await getTask(taskId);
		if (!taskDetail)
			throw Object.assign(new Error(), {
				status: 404,
				message: 'Task not found!',
			});

		const { projectId } = taskDetail;
		const projectDetails = await findProjectById(projectId);
		const { boardType } = projectDetails;

		const taskDetailToSend = { ...taskDetail._doc };
		delete taskDetailToSend._id;
		taskDetailToSend.taskId = taskId;
		taskDetailToSend.boardType = boardType;

		ctx.response.ok({ task: taskDetailToSend }, 'Fetched task detail ');
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};
async function getTasksByUser(ctx) {
	try {
		const userId = ctx?.headers?.userId;
		const userData = await findUserById(userId);
		if (!userData) throw new Error('Invalid user data');

		const tasks = (
			await getUsersAssignedTasks(userData._id, {
				taskId: '$_id',
				taskName: 1,
				projectId: 1,
				projectName: 1,
				updatedOn: 1,
				reporterId: 1,
				reporterName: 1,
				taskNumber: 1,
				assigneeId: 1,
				assigneeName: 1,
				status: 1,
				updatedById: 1,
				createdById: 1,
				updatedByName: 1,
				createdByName: 1,
				boardType: '$projectData.boardType',
				_id: 0,
			})
		).map((task) => ({ ...task, boardType: task.boardType[0] }));

		ctx.response.ok(
			{
				tasks,
			},
			`list of user's task`
		);
	} catch (error) {
		logger.error(`Couldn't get users tasks - ${error}`);
		errorResponseHandler(ctx, error);
	}
}

async function getTasksByProject(ctx) {
	try {
		const { projectId } = ctx.params;
		const { keyword } = ctx.query;
		let tasks = [];
		if (keyword) {
			validate({ keyword }, searchTaskRules);
			const searchData = await searchTaskByProjectId(projectId, keyword);
			tasks = formatTaskData(searchData);
		} else {
			tasks = await findTasksByProjectId(projectId);
		}

		ctx.response.ok({ tasks }, `list of project's task`);
	} catch (error) {
		logger.error(`Couldn't get projects tasks - ${error}`);
		errorResponseHandler(ctx, error);
	}
}

async function updateStatus(ctx) {
	try {
		const { taskId } = ctx.params;
		const { status } = ctx.request.body;
		logger.info('updating task status of id:', taskId);
		const taskStatusUpdateJob = await updateTaskStatus(taskId, status);
		if (!taskStatusUpdateJob)
			throw Object.assign(new Error(), {
				status: 404,
				message: 'Task not found!',
			});
		ctx.response.ok({}, 'Task updated Successfully');
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
}
const removeTaskFromSprintByTaskId = async (ctx) => {
	try {
		const { taskId } = ctx.params;
		const doesSprintIdExistInTask = await getTask(taskId);
		if (!doesSprintIdExistInTask.sprintId) {
			throw Object.assign(new Error(), {
				status: 400,
				message: 'Task dose not exist in sprint',
			});
		}
		await removeTaskFromSprintBy(taskId);
		ctx.response.ok({}, 'Task removed successfully');
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};

const addTaskToSprint = async (ctx) => {
	try {
		const { taskId, sprintId } = ctx.request.body;

		const task = await getTask(taskId);

		if (!task) {
			throw Object.assign(new Error(), {
				status: 404,
				message: 'Task not found!',
			});
		}

		const data = {
			sprintId: mongoose.Types.ObjectId(sprintId),
		};

		await update(taskId, data);
		ctx.response.ok({}, `Sprint added successfully`);
	} catch (error) {
		logger.error(`Couldn't get users tasks - ${error}`);
	}
};
// eslint-disable-next-line consistent-return
const deleteTask = async (ctx) => {
	try {
		const { taskId } = ctx.params;

		const task = await getTask(taskId);

		if (task) {
			await deleteTaskById(taskId);

			return ctx.response.ok({}, 'task delete successfully');
		}
		return ctx.response.error('task not found');
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};
const updateTask = async (ctx) => {
	try {
		const { userId } = ctx.headers;
		const { taskId } = ctx.params;
		const {
			taskName,
			reporterId,
			assigneeId,
			taskDetails,
			priority,
			storyPoint,
			dueDate,
			type,
			status,
			sprintId,
			position,
		} = ctx.request.body;

		const formatPosition = position?.match(/^(top|bottom)-\d+$/);
		if (position && !formatPosition) {
			throw Object.assign(new Error(), {
				status: 404,
				message: 'Invalid position value',
			});
		}
		validate(
			{
				taskName,
				reporterId,
				assigneeId,
				taskDetails,
				priority,
				storyPoint,
				dueDate,
				type,
				status,
				sprintId,
				position: formatPosition?.[0],
			},
			updateTaskRules
		);

		const task = await getTask(taskId);
		const user = await getSingleUser(userId);

		const reporter = await getSingleUser(reporterId);
		const reporterName =
			reporterId === null ? null : reporter?.userName || task?.reporterName;

		const assignee = await getSingleUser(assigneeId);

		const updatedById = userId;
		const updatedByName = user.userName;
		const assigneeName =
			assigneeId === null ? null : assignee?.userName || task?.assigneeName;

		if (!task) {
			throw Object.assign(new Error(), {
				status: 404,
				message: 'Task not found!',
			});
		}

		const updatedTask = await updateTaskById(
			taskId,
			taskName,
			reporterId,
			reporterName,
			assigneeId,
			assigneeName,
			taskDetails,
			priority,
			storyPoint,
			dueDate,
			type,
			status,
			sprintId,
			updatedById,
			updatedByName,
			position ? formatPosition?.[0] : undefined
		);
		await sendEmailToAssignee({
			email: assignee?.userEmail || task?.userEmail,
			taskName: updatedTask.taskName,
			updatedByName: updatedTask.updatedByName,
			projectName: updatedTask.projectName,
			storyPoint: updatedTask.storyPoint,
			updatedOn: updatedTask.updatedOn,
			taskNumber: updatedTask.taskNumber,
			name: assigneeName || task.assigneeName,
		});
		await sendEmailToReporter({
			email: reporter?.userEmail || task?.userEmail,
			taskName: updatedTask.taskName,
			updatedByName: updatedTask.updatedByName,
			projectName: updatedTask.projectName,
			storyPoint: updatedTask.storyPoint,
			updatedOn: updatedTask.updatedOn,
			taskNumber: updatedTask.taskNumber,
			name: reporter?.userName || task?.reporterName,
		});
		ctx.response.ok({ updatedTask }, 'Task Updated successfully');
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};

module.exports = {
	getTasksByUser,
	createNewTask,
	getTaskDetail,
	assignTask,
	removeTaskFromSprintByTaskId,
	addTaskToSprint,
	getTasksByProject,
	updateStatus,
	deleteTask,
	updateTask,
	getTasksWorkedOn
};
