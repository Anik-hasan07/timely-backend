const mongoose = require('mongoose');
const Project = require('../schema/ProjectSchema');

exports.createProject = (data) => {
	const project = new Project(data);
	return project.save();
};

exports.updateProjectById = (id, data) =>
	Project.findByIdAndUpdate(id, data, { new: true });

exports.doesProjectExists = (projectName, organizationId) =>
	Project.findOne({ projectName, organizationId });

exports.findProjectById = (projectId) =>
	Project.findById(mongoose.Types.ObjectId(projectId));

exports.findProjectsByOrganizationId = (organizationId) =>
	Project.find({ organizationId });

exports.changeProjectStatus = (projectId, status) =>
	Project.findByIdAndUpdate(mongoose.Types.ObjectId(projectId), { status });
