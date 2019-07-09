const test = require('ava');
const pretty = require('./../../scripts/lib/prettify-time');

test('prettify-time > 999', (t) => {
	t.assert(pretty(1000) === '1.00 s');
});

test('prettify-time < 999', (t) => {
	t.assert(pretty(100) === '100 ms');
});
