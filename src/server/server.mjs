import './util/load-env';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https'; // Using `https` until this lands https://github.com/expressjs/express/pull/3730 to use http2
import logProcessErrors from 'log-process-errors';
import chalk from 'chalk';
import { app } from './app';
import router from './router/router';

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // eslint-disable-line

// Show some ❤️ to Node.js process errors.
// https://github.com/ehmicky/log-process-errors
logProcessErrors();

// Express routes
app.use(router);

http.createServer(app).listen(app.get('http-port'), () => {
	// If you update the text here update the ./tools/run-server.js RUNNING_REGEXP var also
	console.log('%s Server is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('http-port'), app.get('env'));
});

if (process.env.HTTPS_ENABLED === 'true') {
	https.createServer({
		cert: fs.readFileSync(path.resolve(__dirname, `../ssl/${process.env.SSL_CERT_FILE_NAME}`)),
		key: fs.readFileSync(path.resolve(__dirname, `../ssl/${process.env.SSL_KEY_FILE_NAME}`))
	}, app).listen(app.get('https-port'), () => {
		// If you update the text here update the ./tools/run-server.js RUNNING_REGEXP var also
		console.log('%s Server is running at https://localhost:%d in %s mode', chalk.green('✓'), app.get('https-port'), app.get('env'));
	});
}
