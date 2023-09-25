const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
	comment: {
		type: String,
		required: false,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		reuired: false,
	},
});

const TaskSchema = mongoose.Schema(
	{
		taskName: {
			type: String,
			required: true,
		},
		projectId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		projectName: {
			type: String,
			required: true,
		},
		reporterId: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
		},
		reporterName: {
			type: String,
			required: false,
		},
		assigneeId: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
		},
		sprintId: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: 'Sprint',
		},
		assigneeName: {
			type: String,
			required: false,
		},
		taskDetails: {
			type: String,
			required: false,
		},
		organizationId: {
			type: String,
			required: false,
		},
		createdById: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		createdByName: {
			type: String,
			required: true,
		},
		storyPoint: {
			type: Number,
			required: false,
		},
		dueDate: {
			type: Date,
			required: false,
		},
		priority: {
			type: String,
			required: false,
			enum: ['high', 'highest', 'medium', 'low', 'lowest'],
		},
		type: {
			type: String,
			required: false,
			enum: ['story', 'task', 'bug'],
		},
		taskNumber: {
			type: String,
			required: false,
		},
		comments: [commentSchema],
		attachments: {
			type: Array,
		},
		status: {
			type: String,
			required: false,
			default: 'pending',
			enum: ['pending', 'in progress', 'backlog', 'in review', 'done'],
		},
		updatedById: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
		},
		updatedByName: {
			type: String,
			required: false,
		},
		position: {
			type: String,
			required: false,
		},
	},
	{
		timestamps: {
			createdAt: 'createdOn',
			updatedAt: 'updatedOn',
		},
	}
);

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
