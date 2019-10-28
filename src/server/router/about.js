'use strict';
const config = require('../config');
const globalDataInjector = require('../data/global-injector');

// App template
const template = require(`${config.server.paths.htmlTemplates}/pages/about.marko`);

// Template data
const data = globalDataInjector('about', {
	page: {
		title: 'About page title'
	}
});

function aboutPageRouter (req, res) {
	res.marko(template, data);
}

module.exports = aboutPageRouter;
