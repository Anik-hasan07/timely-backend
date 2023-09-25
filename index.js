require('dotenv').config();
const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('koa2-cors');
const initDB = require('./config/database');
const variables = require('./config/variables');
const { responseHandler } = require('./middlewares');
const logger = require('./logger');
const router = require('./route');

initDB();
const app = new Koa();

app.use(responseHandler());
app.use(koaBody());
app.use(cors({ origin: '*' }));

app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(variables.appPort, () => {
	logger.info(
		`API server listening on port ${variables.appPort}, in ${variables.appEnv}`
	);
});

module.exports = server;
