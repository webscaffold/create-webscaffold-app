import { globalPageAssets } from './global/global-page-assets';
import { pageData } from './global/global-page-data';

export function globalDataInjector(pageName, data) {
	return  {
		app: {
			...pageData,
			...globalPageAssets(pageName)
		},
		...data
	};
}
