// default
require('dotenv').config();

let secrets = {};
try {
	const { timelyApi } = require('../../creds.json');
	secrets = timelyApi;
} catch (e) {
	console.log('no secrets available! but service runs', e);
}

const appPort = process.env.APP_PORT || 7346;
const loggerName = process.env.LOGGER_NAME || 'timely-api';
const serviceName = process.env.SERVICE_NAME || 'timely-api';
const serviceDomain = process.env.SERVICE_DOMAIN || 'timely';
const logLevel = process.env.LOG_LEVEL || 'debug';
const mongoDbUrl =
	process.env.MONGODB_CONN_STRING || secrets.MONGODB_CONN_STRING;
const powerAppsUrl = process.env.POWERAPPS_URL || secrets.POWERAPPS_URL;
const jwtSecretKey = process.env.JWT_SECRET_KEY || secrets.JWT_SECRET_KEY;
const appEnv = process.env.APP_ENV || 'dev';
const emailHost = process.env.EMAIL_HOST || secrets.EMAIL_HOST;
const emailPort = process.env.EMAIL_PORT || secrets.EMAIL_PORT || 587;
const emailUser = process.env.EMAIL_USER || secrets.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD || secrets.EMAIL_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || secrets.EMAIL_FROM;

const sprintStatus = {
	active: 'ACTIVE',
	running: 'RUNNING',
	closed: 'CLOSED',
};

const projectStatus = {
	active: 'ACTIVE',
	inactive: 'INACTIVE',
	deleted: 'DELETED',
};

const invitationStatus = {
	pending: 'PENDING',
	active: 'ACTIVE',
};

const variables = {
	appPort,
	loggerName,
	logLevel,
	serviceName,
	serviceDomain,
	mongoDbUrl,
	jwtSecretKey,
	appEnv,
	sprintStatus,
	projectStatus,
	invitationStatus,
	powerAppsUrl,
	emailHost,
	emailPort,
	emailUser,
	emailPassword,
	emailFrom,
};
console.log(variables);
module.exports = variables;
