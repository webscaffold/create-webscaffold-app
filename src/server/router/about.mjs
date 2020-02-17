import * as config from '../config';
import { globalDataInjector } from '../data/global-injector';

// App template
// import template from `${config.server.paths.htmlTemplates}/pages/about.marko`;
// const template = await import(`${config.server.paths.htmlTemplates}/pages/about.marko`);
let template;
(async () => {
	template = await import(`${config.server.paths.htmlTemplates}/pages/about.marko`);
})();

// Template data
const data = globalDataInjector('about', {
	page: {
		title: 'About page title'
	}
});

export function aboutPageRouter(req, res) {
	res.marko(template, data);
}
