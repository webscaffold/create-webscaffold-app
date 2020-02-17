import path from 'path';
import fs from 'fs';
import joi from 'joi';
import * as config from '../../config';

// Webpack assets file
let webpackStaticAssetsObj;
let webpackStaticAssetsObjLegacy;
let stylesAssetsObj;
let runtimeContent, runtimeContentLegacy;

(async () => {
	webpackStaticAssetsObj = await import(config.server.paths.assetsWebpackJSONFile);
	webpackStaticAssetsObjLegacy = await import(config.server.paths.assetsLegacyWebpackJSONFile);
	stylesAssetsObj = await import(config.server.paths.assetsStylesJSONFile);
})();
console.log(config.server.paths.assetsWebpackJSONFile);
console.log(webpackStaticAssetsObj);
if (webpackStaticAssetsObj.runtime) {
	runtimeContent = fs.readFileSync(path.join(config.server.paths.staticAssets, webpackStaticAssetsObj.runtime.mjs), 'utf-8');
}

if (webpackStaticAssetsObjLegacy.runtime) {
	runtimeContentLegacy = fs.readFileSync(path.join(config.server.paths.staticAssets, webpackStaticAssetsObjLegacy.runtime.js), 'utf-8');
}

const dataSchema = joi.object({
	assets: joi.object({
		styles: joi.array().min(1).required(),
		scripts: joi.array().min(2).required(),
		runtimeContent: joi.string().default(false)
	}),
	assetsLegacy: joi.object({
		styles: joi.array().min(1).required(),
		scripts: joi.array().min(2).required(),
		runtimeContentLegacy: joi.string().default(false)
	})
}).unknown().required();

export function globalPageAssets (script) {
	const data = {
		assets: {
			styles: [],
			scripts: []
		},
		assetsLegacy: {
			styles: [],
			scripts: []
		}
	};

	Object.keys(stylesAssetsObj).map((style) => data.assets.styles.push(stylesAssetsObj[style]));
	Object.keys(stylesAssetsObj).map((style) => data.assetsLegacy.styles.push(stylesAssetsObj[style]));

	if (webpackStaticAssetsObj['chunk-vendors']) data.assets.scripts.push(webpackStaticAssetsObj['chunk-vendors'].mjs);
	if (webpackStaticAssetsObj[script]) data.assets.scripts.push(webpackStaticAssetsObj[script].mjs);
	if (runtimeContent) {
		data.assets.runtimeContent = runtimeContent;
	}

	if (webpackStaticAssetsObjLegacy['chunk-vendors']) data.assetsLegacy.scripts.push(webpackStaticAssetsObjLegacy['chunk-vendors'].js);
	if (webpackStaticAssetsObjLegacy[script]) data.assetsLegacy.scripts.push(webpackStaticAssetsObjLegacy[script].js);
	if (runtimeContentLegacy) {
		data.assetsLegacy.runtimeContentLegacy = runtimeContentLegacy;
	}

	const dataVars = joi.attempt(data, dataSchema)

	return dataVars;
}
