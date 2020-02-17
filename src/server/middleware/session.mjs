import session from 'express-session';

export function expressSession (app, maxAge) {
	app.use(session({
		name: 'sid',
		resave: true,
		saveUninitialized: true,
		secret: process.env.SESSION_SECRET,
		// store: '',
		cookie: {
			httpOnly: true,
			maxAge: maxAge
		} // Configure when sessions expires
	}));
};
