'use strict';

const fs = require('fs');
const path = require('path');
const Emittery = require('emittery');
const { reporter } = require('@webscaffold/task-core');
const clean = require('@webscaffold/task-clean');
const copyStatic = require('@webscaffold/task-copy');
const cssCompiler = require('@webscaffold/task-css-compiler').compiler;
const jsCompiler = require('@webscaffold/task-js-compiler');
// // const imageResize = require('./tasks/image-resize');
// const bs = require('./tasks/browser-sync');
// const runServer = require('./tasks/run-server');
// const watcher = require('./tasks/watcher');
const { config } = require('./config');
const webpackConfig = require('./config/webpack.config.js');

/**
 * Run the dev task, compile css and js and run the local server
 *
 * @param {object} options - Task options object
 * @returns {Promise} - Promise object
 */
async function runDev(options) {
	const eventBus = new Emittery();
	const appDirectory = fs.realpathSync(process.cwd());
	const resolvePath = (relativePath) => path.resolve(appDirectory, relativePath);


	reporter('dev').emit('log', 'starting dev');

	await clean([`${resolvePath(config.paths.buildPath)}/*`], { reporter });

	await copyStatic('static/**/*', resolvePath(config.paths.buildPath), {
		taskName: 'copy:static',
		cpy: {
			cwd: resolvePath(config.paths.srcPath),
			parents: true
		}
	});

	await Promise.all([
		cssCompiler(config.paths.stylesEntryPoint, config.paths.stylesOutputDest, {
			isDebug: options.isDebug,
			eventBus,
			buildPath: resolvePath(config.paths.buildPath),
			sass: {
				sourceMapEmbed:	options.isDebug
			}
		}),
		(async () => {
			process.env.BROWSERSLIST_ENV = 'modern';
			await jsCompiler(webpackConfig(config).modernConfig, { eventBus })

			process.env.BROWSERSLIST_ENV = 'legacy';
			await jsCompiler(webpackConfig(config).legacyConfig, { eventBus })
		})(),
		// imageResize(opts)
	]);

	// await runServer({ inspect: options.nodeInspect });
	// await bs.init({
	// 	eventBus,
	// 	https: process.env.HTTPS_ENABLED,
	// 	key: `src/ssl/${process.env.SSL_KEY_FILE_NAME}`,
	// 	cert: `src/ssl/${process.env.SSL_CERT_FILE_NAME}`
	// });

	// // TODO: Add it back
	// // await new watcher(['src/static/**/*.*'], { ...opts, label: 'static assets' }, () => copyStatic(opts));
	// await new watcher([`${config.paths.srcPath}/styles/**/*.scss`], { label: 'sass files' }, () => {
	// 	return compileCSS(config.paths.stylesEntryPoint, config.paths.stylesOutputDest, {
	// 		isDebug: options.isDebug,
	// 		eventBus,
	// 		buildPath: config.paths.buildPath,
	// 		sass: {
	// 			sourceMapEmbed:	options.isDebug
	// 		}
	// 	});
	// });
	// await new watcher(['src/html/**/*.*'], { label: 'html files' }, () => runServer({ inspect: options.nodeInspect }));
	// await new watcher(['src/server/**/*.js'], { label: 'server files' }, () => runServer({ inspect: options.nodeInspect }));
}

module.exports = runDev;
