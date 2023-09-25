/* eslint-disable no-underscore-dangle */
const { validate, errorResponseHandler } = require('../helpers');
const { createSprint } = require('../utils/sprints');
const {
	createProjectRules,
	inviteMemberRules,
	updateInvitationRules,
	updateProjectRules,
} = require('../helpers/validationRules');
const {
	createInvitation,
	getInvitationById,
	updateInvitationResponse,
} = require('../models/Invitation');
const {
	createProject,
	doesProjectExists,
	findProjectsByOrganizationId,
	findProjectById,
	updateProjectById,
	changeProjectStatus,
} = require('../models/Project');
const { getPendingTasksByIds } = require('../models/Task');
const {
	assignToProject,
	getUserProjects,
	getProjectMembersByProjectId,
	getProjectUsersBy,
	removeUserFromProject,
	activeUserFromProject,
} = require('../models/userProject');
const { projectStatus, powerAppsUrl } = require('../config/variables');
const { sendInvitationEmail } = require('../Adapters/Email');
const { processDeleteProject } = require('../workers/projects');

const formateUserData = (data) => {
	const formateData = data.map(({ user }) => {
		const formateUser = {
			id: user?._id,
			userName: user?.userName,
			userEmail: user?.userEmail,
			userPhoto: user?.userPhoto,
			role: user?.role,
			status: user?.status,
		};
		return formateUser;
	});
	return formateData;
};

exports.createProject = async (ctx) => {
	try {
		const { projectName, boardType, projectPrefix } = ctx.request.body;

		const { userId, organizationId } = ctx.request.headers;
		validate({ projectName, boardType, projectPrefix }, createProjectRules);

		const isDuplicateProject = await doesProjectExists(
			projectName,
			organizationId
		);
		if (isDuplicateProject) {
			throw Object.assign(new Error(), {
				status: 400,
				message: 'Duplicate project name!',
			});
		}

		const { id: projectId } = await createProject({
			organizationId,
			projectName,
			boardType,
			projectPrefix,
		});

		await assignToProject({
			userId,
			organizationId,
			projectId,
			projectInfo: projectId,
		});

		await createSprint({
			projectId,
			organizationId,
			makeActiveSprint: true,
		});

		ctx.response.ok({ projectId }, 'Project created successfully');
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};

exports.updateProject = async (ctx) => {
	try {
		const { projectId } = ctx.params;
		const { projectName, boardType, projectPrefix, status } = ctx.request.body;
		const data = {
			projectName,
			boardType,
			projectPrefix,
			status,
		};

		validate(data, updateProjectRules);
		const project = await findProjectById(projectId);
		if (!project) {
			throw Object.assign(new Error(), {
				status: 400,
				message: 'No project exists with that ID',
			});
		}

		const updatedProject = await updateProjectById(projectId, data);
		ctx.response.ok(updatedProject, 'Project updated successfully');
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};

exports.getUsersProjects = async (ctx) => {
	try {
		const { userId, organizationId } = ctx.headers;
		// task TIM-5
		const userProjectsData = await getUserProjects({
			userId,
			organizationId,
		});

		if (userProjectsData.length === 0) {
			ctx.response.ok(
				{ projects: userProjectsData },
				'You are not asigned to any project'
			);
		}

		if (userProjectsData.length >= 1) {
			const userProjects = [];
			userProjectsData.forEach((singleProject) => {
				if (singleProject?.projectId) {
					const project = {
						projectId: singleProject.projectId._id,
						projectName: singleProject.projectId.projectName,
						boardType: singleProject.projectId.boardType,
						status: singleProject.projectId.status,
						projectPrefix: singleProject.projectId.projectPrefix,
						userStatus: singleProject.projectId.userStatus,
					};
					userProjects.push(project);
				}
			});

			const pendingTask = await getPendingTasksByIds(userProjects);
			const projects = userProjects.map((project) => {
				const projecs = { ...project };
				projecs.totalUnresolvedIssues = pendingTask.filter(
					(task) => task.projectId.toString() === project.projectId.toString()
				)?.length;
				return projecs;
			});

			ctx.response.ok({ projects }, "List of user's project");
		}
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};

exports.inviteMembers = async (ctx) => {
	try {
		const { projectId } = ctx.params;
		const { emails } = ctx.request.body;
		const { organizationId } = ctx.headers;
		validate({ projectId, emails }, inviteMemberRules);

		const invitationIds = [];
		const invitationEmails = [];
		const invitationPromises = emails.map(async (email) => {
			const fields = {
				userEmail: email,
				organizationId,
				projectId,
			};
			const invitation = await createInvitation(fields);
			if (invitation) {
				invitationIds.push(invitation?._id);
				invitationEmails.push(invitation?.userEmail);
			}
			return invitation;
		});
		await Promise.all(invitationPromises);

		const { projectName } = await findProjectById(projectId);
		const emailPromises = invitationEmails.map((email) =>
			sendInvitationEmail({
				email,
				projectName,
				invitationLink: `${powerAppsUrl}&projectId=${projectId}`,
			})
		);
		await Promise.all(emailPromises);
		ctx.response.ok({ invitationIds }, 'Invitation sent successfully');
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};

exports.updateInvitation = async (ctx) => {
	try {
		const { invitationId, response } = ctx.request.body;

		validate({ invitationId, response }, updateInvitationRules);
		const isExistInvitation = await getInvitationById(invitationId);
		if (!isExistInvitation) {
			throw Object.assign(new Error(), {
				status: 404,
				message: 'Invitation not found',
			});
		}
		await updateInvitationResponse(invitationId, response);
		ctx.response.ok({}, 'response submitted successfully');
	} catch (error) {
		errorResponseHandler(ctx, error);
	}
};

const formatedProjects = (projects) =>
	projects.map((project) => ({
		id: project._id,
		organizationId: project.organizationId,
		projectName: project.projectName,
		boardType: project.boardType,
		createdOn: project.createdOn,
		updatedOn: project.updatedOn,
		projectPrefix: project.projectPrefix,
	}));

exports.getOrganizationProjects = async (ctx) => {
	try {
		const { organizationId } = ctx.headers;
		const data = await findProjectsByOrganizationId(organizationId);
		const Projects = formatedProjects(data);
		ctx.response.ok({ Projects }, 'Projects fetched successfully');
	} catch (error) {
		errorResponseHandler(error);
	}
};

exports.searchProjectMembers = async (ctx) => {
	try {
		const { projectId } = ctx.params;
		const keyword = ctx.query?.keyword;

		if (!projectId) {
			return ctx.response.throw(new Error(), 'Project id must be provided');
		}

		if (keyword && keyword?.length < 3) {
			return ctx.response.throw(
				new Error(),
				'keyword must be 3 charactar long'
			);
		}
		const memebers = await getProjectMembersByProjectId(projectId);
		const formattedMembers = memebers.map((member) => ({
			memberId: member?.user?._id,
			name: member?.user?.userName,
			picture: member?.user?.userPhoto,
		}));

		const memberLists = keyword
			? formattedMembers.filter((member) =>
					new RegExp(keyword, 'gi').test(member.name)
			  )
			: formattedMembers;

		return ctx.response.ok(
			{ members: memberLists },
			'Members fetched successfully'
		);
	} catch (error) {
		return errorResponseHandler(ctx, error);
	}
};

exports.getProjectUsers = async (ctx) => {
	try {
		const { projectId } = ctx.params;

		if (!projectId) {
			return ctx.response.throw(new Error(), 'Project id must be provided');
		}

		const projectUsers = await getProjectUsersBy(projectId);

		const users = formateUserData(projectUsers);

		return ctx.response.ok({ users }, 'users fetched successfully');
	} catch (error) {
		return errorResponseHandler(ctx, error);
	}
};

// eslint-disable-next-line consistent-return
exports.deleteProject = async (ctx) => {
	try {
		const { projectId } = ctx.params;
		await changeProjectStatus(projectId, projectStatus.deleted);
		processDeleteProject(projectId);
		return ctx.response.ok(null, 'Deleted successfully');
	} catch (error) {
		return errorResponseHandler(ctx, error);
	}
};

exports.deleteUserFromProject = async (ctx) => {
	try {
		const { projectId, userId } = ctx.params;
		await removeUserFromProject(projectId, userId);
		return ctx.response.ok(null, 'Removed user from project successfully');
	} catch (error) {
		return errorResponseHandler(ctx, error);
	}
};
exports.activeUserFromProject = async (ctx) => {
	try {
		const { projectId, userId } = ctx.params;
		const { status } = ctx.request.body;
		await activeUserFromProject(projectId, userId, status);
		return ctx.response.ok(null, 'User active successfully');
	} catch (error) {
		return errorResponseHandler(ctx, error);
	}
};

exports.getProject = async (ctx) => {
	try {
		const { id } = ctx.params;

		const project = await findProjectById(id);

		if (!project) {
			return ctx.response.throw(new Error(), 'project id not valid ');
		}
		return ctx.response.ok({ project }, 'project fetch successfully');
	} catch (error) {
		return errorResponseHandler(ctx, error);
	}
};
