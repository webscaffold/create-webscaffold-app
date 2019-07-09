// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-console */

class PageAbout {
	constructor() {
		this.pageName = 'about';
		this.pageOptions = {
			foo: 1
		};
		this.pageMeta = {
			bar: 1
		};

		this.init();
	}

	init() {
		console.log({
			...this.pageOptions,
			...this.pageMeta
		})
		console.log(8);
		console.log(`Page ${this.pageName} loaded.`);
	}
}

export default PageAbout;
