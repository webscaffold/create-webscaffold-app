'use strict';

const config = require('../config');
const globalDataInjector = require('../data/global-injector');

// App template
const template = require(`${config.server.paths.htmlTemplates}/pages/home.marko`);

// Template data
const data = globalDataInjector('main', {
	page: {
		title: 'ES6 Web app boilerplate using Gulp + Webpack'
	}
});

function homePageRouter (req, res) {
	res.marko(template, data);
}

module.exports = homePageRouter;
