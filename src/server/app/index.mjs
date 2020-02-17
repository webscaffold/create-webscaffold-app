import timestamp from 'time-stamp';
import chalk from 'chalk';
import express from 'express';
// import sirv from 'sirv';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import compression from 'compression';
import responseTime from 'response-time';
import lusca from 'lusca';
import helmet from 'helmet';
import PrettyError from 'pretty-error';
import errorhandler from 'errorhandler';
import expressRoutesLogger from 'morgan';
import serverTiming from 'server-timing';
import markoExpress from 'marko/express';
import markoNodeRequire from 'marko/node-require';
import { logger } from '../util/logger';
import * as config from '../config';
import { brotliCompression } from '../middleware/brotli-compression';
import { createNoopServiceWorkerMiddleware } from '../middleware/noop-service-worker-middleware';

// Express App with view engine via Marko
// -----------------------------------------------------------------------------

// Allow Node.js to require and load `.marko` files
markoNodeRequire.install({
	extensions: ['.marko', '.html'],
	compilerOptions: {
		writeToDisk: config.common.isProd,
		preserveWhitespace: config.common.isProd
	}
});

const app = express();

app.use(markoExpress()); // enable res.marko(template, data)

// Express configuration.
// -----------------------------------------------------------------------------

// Trust X-Forwarded-* headers so that when we are behind a reverse proxy,
// our connection information is that of the original client (according to
// the proxy), not of the proxy itself. We need this for HTTPS redirection
// and bot rendering.
app.set('trust proxy', true);

// Express http/s ports
app.set('http-port', config.server.port || 3000);
app.set('https-port', config.server.https_port || 3443);

// Records the response time for requests in HTTP servers by adding `X-Response-Time` header to responses.
// Defined as the elapsed time from when a request enters this middleware to when the headers are written out.
app.use(responseTime());

// Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
app.use(cookieParser());

// Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Compress the response output
app.use(compression());

// Session settings
// const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
// TODO: Add middleware sesstio back.

// Extra (loggers, security)
// -----------------------------------------------------------------------------

// Morgan logger for express
expressRoutesLogger.token('timestamp', () => {
	return '[' + chalk.magenta(timestamp('HH:mm:ss')) + '] [' + chalk.magenta('server') + ']';
});
app.use(expressRoutesLogger(config.server.morganLogLevel));

// Application security
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(helmet());

// Add [Server-Timing](https://www.w3.org/TR/server-timing/) to response headers.
app.use(serverTiming());

// Middlewares
// -----------------------------------------------------------------------------
// app.use(webpMiddleware(config.server.paths.staticAssets));

if (process.env.USE_BROTLI === 'true') {
	app.use('/scripts/', brotliCompression({ logger: console }));
}

// Redirect to HTTPS automatically if options is set
if (process.env.HTTPS_REDIRECT === 'true') {
	logger.log('info', 'Redirecting HTTP requests to HTTPS');

	app.use((req, res, next) => {
		if (req.secure) {
			next();
			return;
		}

		res.redirect(301, `https://${req.hostname}${req.url}`);
	});
}

// Return source maps in production only to requests passint then `X-SOURCE-MAP-TOKEN` header token (Sentry for example)
if (config.common.isProd) {
	app.get(/\.js\.map/, (req, res, next) => {
		const hedSourceMapToken = req.get('X-SOURCE-MAP-TOKEN');
		const envSourceMapToken = process.env['X-SOURCE-MAP-TOKEN'];

		logger.log('debug', `source map request from : ${req.ip} ${req.originalUrl}`);

		if (hedSourceMapToken === undefined || (envSourceMapToken && envSourceMapToken !== hedSourceMapToken)) {
			logger.log('debug', `source map request invalid using token: ${hedSourceMapToken}`);

			res
				.status(401)
				.send('Authentication access token is required to access the source map');

			return;
		}

		logger.log('debug', `source map request valid using token: ${hedSourceMapToken}`);

		next();
	});
}

// This service worker file is effectively a 'no-op' that will reset any
// previous service worker registered for the same host:port combination.
// We do this in development to avoid hitting the production cache if
// it used the same host and port.
// https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432
if (!config.common.isProd) {
	logger.log('debug', 'Using noop service worker middleware');
	app.use(createNoopServiceWorkerMiddleware());
}

// Routes
// -----------------------------------------------------------------------------

// Register express static for all files within the static folder.
// Set the max-age property of the Cache-Control header for all static assets to 1 year.
// Using a long term cache is a good strategy considering that all assetes will be versioned.
app.use('/', express.static(config.server.paths.staticAssets, {
	maxAge: '1y'
}));
// Using express.static until sirv accepts middleware header changes.
// app.use(sirv(config.server.paths.staticAssets, {
// 	etag: true,
// 	maxAge: 31536000 // 1Y
// }));

// Error handling
// -----------------------------------------------------------------------------

const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

app.use((err, req, res, next) => {
	res.status(err.status || 500);

	process.stderr.write(pe.render(err));

	res.render('error', {
		message: err.message,
		error: {}
	});

	next();
});

if (process.env.NODE_ENV === 'development') {
	app.use(errorhandler());
}

export { app };
