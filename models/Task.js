/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
const { default: mongoose } = require('mongoose');
const Task = require('../schema/TaskSchema');

exports.createTask = (data) => {
	const task = new Task(data);
	return task.save();
};
exports.checkIfTaskExists = async (taskName, projectId) =>
	(await Task.findOne({ taskName, projectId })) !== null;

exports.getTask = async (taskId) => Task.findById(taskId, { __v: 0 });

exports.updateAssignee = async (taskId, data) => {
	await Task.findOneAndUpdate(
		{ _id: mongoose.Types.ObjectId(taskId) },
		{
			$set: { ...data },
		}
	);
};
exports.getUsersAssignedTasks = (id, projection = {}) =>
	Task.aggregate()
		.match({ assigneeId: id })
		.lookup({
			from: 'projects',
			localField: 'projectId',
			foreignField: '_id',
			as: 'projectData',
		})
		.project(projection);

exports.getPendingTasksByIds = (projects) => {
	const ids = projects.map((project) =>
		mongoose.Types.ObjectId(project.projectId)
	);
	return Task.find({
		projectId: {
			$in: ids,
		},
		status: 'pending',
	}).select(['projectId', 'status']);
};
exports.removeTaskFromSprintBy = async (taskId) => {
	await Task.updateOne(
		{ _id: mongoose.Types.ObjectId(taskId) },
		{ $unset: { sprintId: 1 } },
		{ new: true }
	);
};

exports.update = async (taskId, data) => {
	await Task.findOneAndUpdate(
		{ _id: mongoose.Types.ObjectId(taskId) },
		{
			$set: { ...data },
		}
	);
};
exports.getTotalTaskByProjectId = (projectId) =>
	Task.find({ projectId: mongoose.Types.ObjectId(projectId) });

exports.getWorkedOnTasks = async (userId) => {
	const tasks = await Task.find({
		$or: [
			{ createdById: mongoose.Types.ObjectId(userId) },
			{ updatedById: mongoose.Types.ObjectId(userId) },
		],
	})
		.select({
			taskId: '$_id',
			taskName: 1,
			projectId: 1,
			projectName: 1,
			taskNumber: 1,
			assigneeId: 1,
			status: 1,
			updatedById: 1,
			createdById: 1,
			_id: 0,
		})
		.exec();

	return tasks;
};

exports.searchTaskByProjectId = (projectId, keyword) =>
	Task.find({
		projectId: mongoose.Types.ObjectId(projectId),
		$or: [
			{
				taskName: { $regex: keyword },
			},
			{
				projectName: { $regex: keyword },
			},
		],
	});

exports.updateTaskStatus = async (taskId, status) =>
	Task.findOneAndUpdate(
		{ _id: mongoose.Types.ObjectId(taskId) },
		{
			$set: {
				status,
			},
		}
	);
exports.findTasksByProjectId = (projectId) =>
	Task.aggregate([
		{ $match: { projectId: mongoose.Types.ObjectId(projectId) } },
		{
			$project: {
				taskId: '$_id',
				taskName: 1,
				projectId: 1,
				projectName: 1,
				updatedOn: 1,
				reporterId: 1,
				reporterName: 1,
				status: 1,
				sprintId: 1,
				taskNumber: 1,
				storyPoint: 1,
				assigneeId: 1,
				assigneeName: 1,
				type: 1,
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

exports.deleteTaskById = async (taskId) => Task.findByIdAndDelete(taskId);
exports.updateTaskById = async (
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
	position
) => {
	const updatedTask = await Task.findByIdAndUpdate(
		{ _id: mongoose.Types.ObjectId(taskId) },
		{
			$set: {
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
				position,
			},
		},
		{ new: true }
	);
	return updatedTask;
};

exports.deleteTasksByProjectId = (projectId) =>
	Task.deleteMany({ projectId: mongoose.Types.ObjectId(projectId) });
