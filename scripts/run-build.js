'use strict';

const fs = require('fs');
const path = require('path');
const { reporter } = require('@webscaffold/task-core');
const clean = require('@webscaffold/task-clean');
const copy = require('@webscaffold/task-copy');
const cssCompiler = require('@webscaffold/task-css-compiler').compiler;
const jsCompiler = require('@webscaffold/task-js-compiler');
const { config } = require('./config');
const webpackConfig = require('./config/webpack.config.js');
const pkg = require('../package.json');

const appDirectory = fs.realpathSync(process.cwd());
const resolvePath = (relativePath) => path.resolve(appDirectory, relativePath);

const cssCompilerTask = (options) => cssCompiler(config.paths.stylesEntryPoint, config.paths.stylesOutputDest, {
	isDebug: options.isDebug,
	buildPath: resolvePath(config.paths.buildPath),
	sass: {
		sourceMapEmbed:	options.isDebug
	}
});

/**
 * Run the build task, building a production ready app
 *
 * @param {object} options - Task options object
 * @returns {Promise} - Promise object
 */
module.exports = async function(options) {
	if (options.logLevel) {
		process.env.WEBSCAFFOLD_LOG_LEVEL = 'debug';
	}

	reporter('build').emit('log', 'starting build');

	await clean([`${resolvePath(config.paths.buildPath)}/*`], { reporter });

	const cpy = { cwd: resolvePath(config.paths.srcPath), parents: true };
	await Promise.all([
		copy('static/**/*', resolvePath(config.paths.buildPath), { taskName: 'copy:static', cpy }),
		copy('server/**/*', resolvePath(config.paths.buildPath), { taskName: 'copy:server', cpy }),
		copy('html/**/*', resolvePath(config.paths.buildPath), { taskName: 'copy:server-template', cpy }),
		copy('ssl/**/*', resolvePath(config.paths.buildPath), { taskName: 'copy:ssl', cpy }),
		fs.promises.writeFile(config.paths.buildPath + '/package.json', JSON.stringify({
			private: true,
			engines: pkg.engines,
			dependencies: pkg.dependencies,
			scripts: {
				start: 'node ./server/server.js',
			},
		}, null, 2)),
		fs.promises.copyFile('.env', config.paths.buildPath + '/.env')
	]);

	await Promise.all([
		cssCompilerTask(options),
		(async () => {
			process.env.BROWSERSLIST_ENV = 'modern';
			await jsCompiler(webpackConfig(config).modernConfig)

			process.env.BROWSERSLIST_ENV = 'legacy';
			await jsCompiler(webpackConfig(config).legacyConfig)
		})(),
		// imagemin(opts)
	]);
	// await compression(opts);
	// await imageResize(opts);
};
