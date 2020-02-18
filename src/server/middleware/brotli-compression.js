'use strict';

const mime = require('mime');
const findEncoding = require('../util/encoding-selection').findEncoding;

// TODO: Use the internal logger instead of console
module.exports = function(app) {
	console.log('info', 'Using brotli redirects for JS and CSS files');

	/**
	 * Brotli request handler
	 *
	 * @param {object} request Express request object
	 * @param {object} response Express response object
	 * @param {Function} next Express next function
	 */
	function brotliRequestHandler(request, response, next) {
		console.log('debug', `Brotli redirect for: ${request.url}`);

		// Get browser's' supported encodings
		const acceptEncoding = request.header('accept-encoding');

		const compressionType = findEncoding(acceptEncoding, [{ encodingName: 'br' }]);

		// Check for null first, becuase apps like Sentry for example don't add `accept-encoding` to the request
		if (compressionType !== null && compressionType.encodingName === 'br') {
			const type = mime.getType(request.path);
			let search = request.url.split('?').splice(1).join('?');

			if (search !== '') {
				search = '?' + search;
			}

			request.url = request.url + '.br';
			// As long as there is any compression available for this file, add the Vary Header (used for caching proxies)
			response.setHeader('Vary', 'Accept-Encoding');
			response.setHeader('Content-Encoding', 'br');
			response.setHeader('Content-Type', type);
		} else {
			console.log('debug', `Brotli redirect failed: compressionType: ${JSON.stringify(compressionType)}`);
		}

		next();
	}

	app.use(brotliRequestHandler);
};
