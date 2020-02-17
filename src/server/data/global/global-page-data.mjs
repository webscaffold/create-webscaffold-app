import joi from 'joi';
import * as config from '../../config';

const dataSchema = joi.object({
	isProd: joi.boolean().required(),
	domainName: joi.string()
}).unknown().required();

const data = {
	isProd: config.isProd,
	domainName: process.env.APP_DOMAIN_NAME
};

export const pageData = joi.attempt(data, dataSchema);
