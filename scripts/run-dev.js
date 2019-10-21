'use strict';

const fs = require('fs');
const path = require('path');
const Emittery = require('emittery');
const nodemon = require('nodemon');
const { reporter } = require('@webscaffold/task-core');
const clean = require('@webscaffold/task-clean');
const copy = require('@webscaffold/task-copy');
const cssCompiler = require('@webscaffold/task-css-compiler').compiler;
const jsCompiler = require('@webscaffold/task-js-compiler');
const browserSync = require('@webscaffold/task-browser-sync');
const watcher = require('@webscaffold/task-watcher');
const { config } = require('./config');
const webpackConfig = require('./config/webpack.config.js');

const eventBus = new Emittery();
const appDirectory = fs.realpathSync(process.cwd());
const resolvePath = (relativePath) => path.resolve(appDirectory, relativePath);

const copyStatic = () => copy('static/**/*', resolvePath(config.paths.buildPath), {
	taskName: 'copy:static',
	cpy: {
		cwd: resolvePath(config.paths.srcPath),
		parents: true
	}
});
const sassCompiler = (options) => cssCompiler(config.paths.stylesEntryPoint, config.paths.stylesOutputDest, {
	isDebug: options.isDebug,
	eventBus,
	buildPath: resolvePath(config.paths.buildPath),
	sass: {
		sourceMapEmbed:	options.isDebug
	}
});
// const runDevServer = (options) => runServer('src/server/server.js', { inspect: options.nodeInspect });

/**
 * Run the dev task, compile css and js and run the local server
 *
 * @param {object} options - Task options object
 * @returns {Promise} - Promise object
 */
module.exports = async function(options) {
	if (options.logLevel) {
		process.env.WEBSCAFFOLD_LOG_LEVEL = 'debug';
	}

	reporter('dev').emit('log', 'starting dev');

	await clean([`${resolvePath(config.paths.buildPath)}/*`]);
	await copyStatic();
	await Promise.all([
		sassCompiler(options),
		(async () => {
			process.env.BROWSERSLIST_ENV = 'modern';
			await jsCompiler(webpackConfig(config).modernConfig)

			process.env.BROWSERSLIST_ENV = 'legacy';
			await jsCompiler(webpackConfig(config).legacyConfig)
		})()
	]);

	nodemon({
		script: 'src/server/server.js',
		verbose: options.logLevel,
		watch: [
			'./src/html',
			'./src/server'
		],
		ext: 'js json marko'
	});

	nodemon.on('start', function () {
		reporter('dev').emit('start', 'starting node server (via expressjs)');
	}).on('quit', function () {
		reporter('dev').emit('done', 'local node server terminated');
		// eslint-disable-next-line no-process-exit, unicorn/no-process-exit
		process.exit();
	}).on('restart', function (files) {
		reporter('dev').emit('info', `restarting node server due to changes to: ${files}`);
	});

	await browserSync.init({
		eventBus,
		https: process.env.HTTPS_ENABLED,
		key: `src/ssl/${process.env.SSL_KEY_FILE_NAME}`,
		cert: `src/ssl/${process.env.SSL_CERT_FILE_NAME}`
	});

	await new watcher(['src/static/**/*.*'], { label: 'static assets' }, () => copyStatic());
	await new watcher([`src/styles/**/*.scss`], { label: 'sass files' }, () => sassCompiler(options));
};
