import * as config from '../config';
import { globalDataInjector } from '../data/global-injector';

// App template
// const template = require(`${config.server.paths.htmlTemplates}/pages/home.marko`);
let template;
(async () => {
	template = await import(`${config.server.paths.htmlTemplates}/pages/home.marko`);
})();

// Template data
const data = globalDataInjector('main', {
	page: {
		title: 'ES6 Web app boilerplate using Gulp + Webpack'
	}
});

export function homePageRouter (req, res) {
	res.marko(template, data);
}
