'use strict';

const fs = require('fs');
const path = require('path');
const Emittery = require('emittery');
const { reporter } = require('@webscaffold/task-core');
const clean = require('@webscaffold/task-clean');
const copy = require('@webscaffold/task-copy');
const cssCompiler = require('@webscaffold/task-css-compiler').compiler;
const jsCompiler = require('@webscaffold/task-js-compiler');
const browserSync = require('@webscaffold/task-browser-sync');
const watcher = require('@webscaffold/task-watcher');
const runServer = require('./tasks/task-server');
const { config } = require('./config');
const webpackConfig = require('./config/webpack.config.js');

const eventBus = new Emittery();
const appDirectory = fs.realpathSync(process.cwd());
const resolvePath = (relativePath) => path.resolve(appDirectory, relativePath);

const copyStaticTask = () => copy('static/**/*', resolvePath(config.paths.buildPath), {
	taskName: 'copy:static',
	cpy: {
		cwd: resolvePath(config.paths.srcPath),
		parents: true
	}
});
const cssCompilerTask = (options) => cssCompiler(config.paths.stylesEntryPoint, config.paths.stylesOutputDest, {
	isDebug: options.isDebug,
	eventBus,
	buildPath: resolvePath(config.paths.buildPath),
	sass: {
		sourceMapEmbed:	options.isDebug
	}
});
const runServerTask = (options) => runServer('src/server/server.js', { inspect: options.nodeInspect });

/**
 * Run the dev task, compile css and js and run the local server
 *
 * @param {object} options - Task options object
 * @returns {Promise} - Promise object
 */
module.exports = async function(options) {
	reporter('dev').emit('log', 'starting dev');

	await clean([`${resolvePath(config.paths.buildPath)}/*`], { reporter });
	await copyStaticTask();
	await Promise.all([
		cssCompilerTask(options),
		(async () => {
			process.env.BROWSERSLIST_ENV = 'modern';
			await jsCompiler(webpackConfig(config).modernConfig, { eventBus })

			process.env.BROWSERSLIST_ENV = 'legacy';
			await jsCompiler(webpackConfig(config).legacyConfig, { eventBus })
		})()
	]);
	await runServerTask(options);
	await browserSync.init({
		eventBus,
		https: process.env.HTTPS_ENABLED,
		key: `src/ssl/${process.env.SSL_KEY_FILE_NAME}`,
		cert: `src/ssl/${process.env.SSL_CERT_FILE_NAME}`
	});

	await new watcher(['src/static/**/*.*'], { label: 'static assets' }, () => copyStaticTask());
	await new watcher([`src/styles/**/*.scss`], { label: 'sass files' }, () => cssCompilerTask(options));
	await new watcher(['src/html/**/*.*'], { label: 'html files' }, () => runServerTask(options));
	await new watcher(['src/server/**/*.js'], { label: 'server files' }, () => runServerTask(options));
};
