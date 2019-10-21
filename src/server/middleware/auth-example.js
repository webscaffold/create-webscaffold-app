// eslint-disable-next-line filenames/match-exported
'use strict';

const auth = function(req, res, next) {
	if (req.session && req.session.user === 'user@domain.com' && req.session.admin) return next();
	// else return res.sendStatus(401);
	else return res.redirect('/admin/login');
};

module.exports = auth;
