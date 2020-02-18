'use strict';

const installHTTPSRedirect = require('./https-redirect');
const installBrotliCompression = require('./brotli-compression');

module.exports = {
	installHTTPSRedirect,
	installBrotliCompression
};
