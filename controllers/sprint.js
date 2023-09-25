const {
	startSprint,
	endSprint,
	sprintTaskById,
	sprintsByProject,
	sprintCount,
	generateSprint,
	getActiveSprint,
	updateTaskSprint,
	moveTasksToBacklog,
} = require('../models/Sprint');
const { errorResponseHandler, validate } = require('../helpers');
const { generateBurnDownReport } = require('../workers/reports');
const { processIncompleteTasks } = require('../workers/tasks');
const { createSprint } = require('../utils/sprints');
const { sprintStatus } = require('../config/variables');
const { startSprintRules } = require('../helpers/validationRules');

exports.generateSprint = async (ctx) => {
	try {
		const { projectId, status } = ctx.request.body;
		const { organizationId } = ctx.request.headers;
		const sprints = await sprintCount(projectId);
		const sprintNumber = sprints + 1;
		const sprint = await generateSprint({
			projectId,
			organizationId,
			status,
			sprintNumber,
		});
		return ctx.response.ok({ sprint }, 'Sprint genarate Successfully');
	} catch (error) {
		return errorResponseHandler(ctx, error);
	}
};

exports.startSprintById = async (ctx) => {
	try {
		const { sprintId } = ctx.params;
		const { startDate, endDate } = ctx.request.body;
		if (!sprintId) {
			return ctx.response.throw(new Error(), 'SprintId must be provided');
		}

		validate(
			{
				sprintId,
				startDate,
				endDate,
			},
			startSprintRules
		);

		const modifiedValue = await startSprint({
			sprintId,
			startDate,
			endDate,
		});
		if (modifiedValue?.status === sprintStatus.running) {
			return ctx.response.ok({}, 'Sprint started successfully');
		}
		return ctx.response.throw(new Error(), "Sprint couldn't be started");
	} catch (error) {
		return errorResponseHandler(ctx, error);
	}
};

exports.endSprintById = async (ctx) => {
	try {
		const { sprintId } = ctx.params;
		const { moveTo } = ctx.request.body;

		const tasks = await sprintTaskById(sprintId);

		const modifiedValue = await endSprint(sprintId);

		if (modifiedValue?.status === sprintStatus.closed) {
			generateBurnDownReport();
			processIncompleteTasks();
			const newSprint = await createSprint({
				organizationId: modifiedValue.organizationId,
				projectId: modifiedValue.projectId,
				makeActiveSprint: true,
			});
			if (moveTo === 'new-sprint' && tasks) {
				await updateTaskSprint(sprintId, newSprint.sprintId);
			}
			if (moveTo === 'backlog' && tasks) {
				await moveTasksToBacklog(sprintId);
			}

			return ctx.response.ok({}, 'Sprint closed Successfully');
		}

		return ctx.response.throw(new Error(), "Sprint couldn't be ended");
	} catch (error) {
		return errorResponseHandler(ctx, error);
	}
};

exports.getSprintTask = async (ctx) => {
	try {
		const { sprintId } = ctx.params;
		if (!sprintId) {
			ctx.response.throw(new Error(), 'SprintId must be provided');
		}

		const tasks = await sprintTaskById(sprintId);
		const modifyTaskData = tasks.map(
			({
				_id,
				type,
				taskName,
				status,
				assigneeName,
				reporterName,
				storyPoint,
				taskNumber,
				taskDetails,
				attachments,
				projectId,
				reporterId,
				projectName,
				assigneeId,
				priority,
				position,
			}) => ({
				taskId: _id,
				type,
				storyPoint,
				taskName,
				taskNumber,
				taskDetails,
				status,
				attachments,
				priority,
				projectId,
				projectName,
				sprintId,
				assigneeId,
				assigneeName,
				reporterId,
				reporterName,
				position,
			})
		);
		ctx.response.ok(
			{ tasks: modifyTaskData },
			'Task list fetched successfully'
		);
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};

// eslint-disable-next-line consistent-return
exports.getActiveSprint = async (ctx) => {
	try {
		const { orgId, projectId } = ctx.params;
		const activeSprint = await getActiveSprint(orgId, projectId);
		if (!activeSprint) {
			return ctx.response.throw(
				new Error(),
				'OrganizationID and ProjectionID  must be provided'
			);
		}
		return ctx.response.ok(
			{ activeSprint },
			'ActiveSprints found Successfully'
		);
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};

exports.getSprintsByProject = async (ctx) => {
	try {
		const { projectId } = ctx.params;

		const sprints = await sprintsByProject(projectId, ctx.query?.status);

		const formattedSprints = sprints.map(
			({ _id, sprintNumber, status, startDate, endDate }) => ({
				sprintId: _id,
				sprintNumber,
				sprintName: `Sprint ${sprintNumber}`,
				status,
				startDate,
				endDate,
			})
		);
		ctx.response.ok(
			{ sprints: formattedSprints },
			'Sprint list fetched successfully'
		);
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};
