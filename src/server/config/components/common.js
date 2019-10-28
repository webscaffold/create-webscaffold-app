'use strict';

const isProd = process.env.NODE_ENV === 'production';

const common = {
	isProd
};

module.exports = common;
