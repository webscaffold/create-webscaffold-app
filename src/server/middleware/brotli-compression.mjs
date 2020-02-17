import mime from 'mime';
import { findEncoding } from '../util/encoding-selection';

export const brotliCompression = function(options) {
	const logger = options.logger;

	logger.log('info', 'Using brotli redirects for JS and CSS files');

	return function(request, response, next) {
		logger.log('debug', `Brotli redirect for: ${request.url}`);

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
			logger.log('debug', `Brotli redirect failed: compressionType: ${JSON.stringify(compressionType)}`);
		}

		next();
	}
};
