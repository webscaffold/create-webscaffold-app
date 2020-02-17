import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // eslint-disable-line
let dirname = __dirname;

// I have updated the func not to replace the current extension and just append .webp
function updateReqUrl(ext, req, res, next, pathname, extpos) {
	// const tempPathname = pathname.substr(0, extpos) + '.' + ext;
	const tempPathname = pathname + '.' + ext;
	const tempFilename = path.normalize(dirname + tempPathname);
	fs.stat(tempFilename, function(err, stats) {
		if (err) {
			next();
		} else if (stats.isFile()) {
			req.originalUrl = req.url;
			req.url = req.url.replace(pathname, tempPathname);
			res.setHeader('Vary', 'Accept');
			next();
		}
	});
}

export function webp(root) {
	dirname = root;
	return function(req, res, next) {
		const parsed = new URL(req.url, `${req.protocol}://${req.headers.host}/`);
		const pathname = parsed.pathname;
		const extpos = pathname.lastIndexOf('.');
		const ext = pathname.substr(extpos + 1);
		if (ext === 'jpeg' || ext === 'jpg' || ext === 'png') {
			if (req.headers.accept && req.headers.accept.includes('image/webp')) {
				updateReqUrl('webp', req, res, next, pathname, extpos);
			} else {
				next();
			}
		} else {
			next();
		}
	};
};
