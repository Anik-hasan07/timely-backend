/* eslint-disable no-console */
const fs = require('fs');
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');
const variables = require('../config/variables');

function renderEmail(templatePath, data) {
	const source = fs.readFileSync(templatePath, 'utf8');
	const template = handlebars.compile(source);
	return template(data);
}

const sendEmail = async (params) => {
	const { toEmail, subjectName, html } = params;
	const port = parseInt(variables.emailPort, 10);
	const transporter = nodemailer.createTransport({
		host: variables.emailHost,
		port,
		secure: port === 465,
		auth: {
			user: variables.emailUser,
			pass: variables.emailPassword,
		},
	});
	const mailOptions = {
		from: variables.emailFrom,
		to: toEmail,
		subject: subjectName,
		html,
	};
	transporter.sendMail(mailOptions, () => {});
};

exports.sendInvitationEmail = async (params) => {
	try {
		const { email, projectName, invitationLink } = params;
		const renderedHtml = renderEmail(
			'Adapters/templates/invitation-email.hbs',
			{
				projectName,
				invitationLink,
			}
		);
		const mailOptions = {
			toEmail: email,
			subjectName: `Invitation to Join ${projectName}`,
			html: renderedHtml,
		};

		await sendEmail(mailOptions);
	} catch (error) {
		console.log(`Error at sending invitation email - ${error}`);
	}
};

exports.sendEmailToAssignee = async (params) => {
	try {
		const {
			email,
			taskName,
			updatedByName,
			projectName,
			storyPoint,
			updatedOn,
			taskNumber,
			name,
		} = params;
		const renderedHtml = renderEmail('Adapters/templates/notification.hbs', {
			projectName,
			taskName,
			updatedByName,
			storyPoint,
			updatedOn,
			name,
			taskNumber,
		});
		const mailOptions = {
			toEmail: email,
			subjectName: `The task description has been updated for task number  ${taskNumber}`,
			html: renderedHtml,
		};
		await sendEmail(mailOptions);
	} catch (error) {
		console.log(`Error at sending invitation email - ${error}`);
	}
};
exports.sendEmailToReporter = async (params) => {
	try {
		const {
			email,
			name,
			taskName,
			updatedByName,
			projectName,
			storyPoint,
			updatedOn,
			taskNumber,
			assigneeName,
		} = params;
		const renderedHtml = renderEmail('Adapters/templates/notification.hbs', {
			projectName,
			taskName,
			updatedByName,
			storyPoint,
			updatedOn,
			assigneeName,
			taskNumber,
			name,
		});
		const mailOptions = {
			toEmail: email,
			subjectName: `The task description has been updated for task number  ${taskNumber}`,
			html: renderedHtml,
		};
		await sendEmail(mailOptions);
	} catch (error) {
		console.log(`Error at sending invitation email - ${error}`);
	}
};
