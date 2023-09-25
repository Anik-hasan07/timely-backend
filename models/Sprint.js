const mongoose = require('mongoose');
const Sprint = require('../schema/SprintSchema');
const ActiveSprint = require('../schema/ActiveSprintSchema');
const { sprintStatus } = require('../config/variables');
const Task = require('../schema/TaskSchema');

exports.createSprint = (data) => Sprint.create(data);
exports.generateSprint = (data) => Sprint.create(data);
exports.createActiveSprint = (data) =>
	ActiveSprint.findOneAndUpdate(
		{
			organizationId: mongoose.Types.ObjectId(data.organizationId),
			projectId: mongoose.Types.ObjectId(data.projectId),
		},
		data,
		{
			new: true,
			upsert: true,
		}
	);

exports.getLatestSprint = async (projectId, organizationId) => {
	const sprint = await Sprint.find({
		projectId: mongoose.Types.ObjectId(projectId),
		organizationId: mongoose.Types.ObjectId(organizationId),
	})
		.sort({ sprintNumber: -1 })
		.limit(1);

	return sprint ? sprint[0] : null;
};

exports.getActiveSprint = async (organizationId, projectId) => {
	const activeSprint = await ActiveSprint.findOne({
		organizationId,
		projectId,
	}).populate('sprintId');

	return activeSprint;
};

exports.startSprint = ({ sprintId, startDate, endDate }) =>
	Sprint.findByIdAndUpdate(
		sprintId,
		{
			startDate: startDate || new Date().getTime(),
			endDate,
			status: sprintStatus.running,
		},
		{
			returnDocument: 'after',
		}
	);

exports.endSprint = (sprintId) =>
	Sprint.findByIdAndUpdate(
		sprintId,
		{
			endDate: new Date().getTime(),
			status: sprintStatus.closed,
		},
		{
			returnDocument: 'after',
		}
	);

exports.sprintTaskById = (sprintId) =>
	Task.aggregate([
		{ $match: { sprintId: mongoose.Types.ObjectId(sprintId) } },
		{
			$project: {
				taskId: '$_id',
				type: 1,
				taskName: 1,
				status: 1,
				assigneeName: 1,
				reporterName: 1,
				storyPoint: 1,
				taskNumber: 1,
				taskDetails: 1,
				attachments: 1,
				projectId: 1,
				reporterId: 1,
				projectName: 1,
				assigneeId: 1,
				priority: 1,
				position: 1,
				customSort: {
					$switch: {
						branches: [
							{
								case: { $regexMatch: { input: '$position', regex: '^top-' } },
								then: {
									$subtract: [0, { $toInt: { $substr: ['$position', 4, -1] } }],
								},
							},
							{
								case: {
									$regexMatch: { input: '$position', regex: '^bottom-' },
								},
								then: {
									$add: [1, { $toInt: { $substr: ['$position', 7, -1] } }],
								},
							},
						],
						default: 0,
					},
				},
			},
		},
		{ $sort: { customSort: 1 } },
		{ $project: { customSort: 0 } },
	]);

exports.sprintsByProject = (projectId, status) =>
	Sprint.find({
		projectId: mongoose.Types.ObjectId(projectId),
		...(status ? { status } : {}),
	});
exports.sprintCount = async (projectId) => {
	const numberOfProjectSprint = await Sprint.countDocuments({
		projectId,
	});
	return numberOfProjectSprint;
};
exports.updateTaskSprint = async (sprintId, newSprint) => {
	const tskSprintUpdate = Task.updateMany(
		{ sprintId: mongoose.Types.ObjectId(sprintId), status: { $ne: 'done' } },
		{ $set: { sprintId: newSprint } }
	);
	return tskSprintUpdate;
};
exports.moveTasksToBacklog = async (sprintId) => {
	const moveToBacklog = Task.updateMany(
		{ sprintId: mongoose.Types.ObjectId(sprintId), status: { $ne: 'done' } },
		{ $unset: { sprintId: 1 } }
	);
	return moveToBacklog;
};
exports.deleteSprintsByProjectId = async (projectId) =>
	Sprint.deleteMany({ projectId: mongoose.Types.ObjectId(projectId) });
