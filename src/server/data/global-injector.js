'use strict';

const pageDataAssets = require('./global/global-page-assets');
const pageData = require('./global/global-page-data');

module.exports = function(pageName, data) {
	return  {
		app: {
			...pageData,
			...pageDataAssets(pageName)
		},
		...data
	};
};
