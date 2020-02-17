/* eslint-disable eslint-comments/disable-enable-pair, unicorn/prevent-abbreviations */
import path from 'path';
import dotenv from 'dotenv';

export const loadEnv = (nodeEnv) => {
	const environmentSpecificLocalEnv = dotenv.config({
		path: path.resolve(`.env.${nodeEnv}.local`),
	});

	const localEnv =
		nodeEnv === 'test'
			? {}
			: dotenv.config({
				path: path.resolve(`.env.local`),
			});

	const environmentSpecificEnv = dotenv.config({
		path: path.resolve(`.env.${nodeEnv}`),
	});

	const defaultEnv = dotenv.config({ path: path.resolve('.env') });

	return Object.assign({}, defaultEnv.parsed, environmentSpecificEnv.parsed, localEnv.parsed, environmentSpecificLocalEnv.parsed);
};

export default loadEnv(process.env.NODE_ENV);
