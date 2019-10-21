```js
// Rate limit options
// https://www.npmjs.com/package/express-brute,
// https://github.com/animir/node-rate-limiter-flexible
// https://github.com/energizer91/smart-request-balancer
const rateLimit = require('express-rate-limit');

// Enable rate limite only when needed
if (config.isProd) {
	// Express Rate Limit
	const limiter = new rateLimit({
		windowMs: 15*60*1000, // 15 minutes
		max: 250, // limit each IP to 100 requests per windowMs
		delayMs: 0, // disable delaying - full speed until the max limit is reached,
		onLimitReached: () => {
			logger.log('warn', 'Express Rate Limit reached');
		}
	});
	app.use(limiter);
}
```
