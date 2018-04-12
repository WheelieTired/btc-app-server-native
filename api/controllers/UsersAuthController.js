/* global Users, Tokens */
/**
 * UsersAuthController
 */

const passport = require('passport');
const moment = require('moment');
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));
const pdbad = 'http://btc-admin:damsel-custard-tramway-ethanol@52.91.46.42:5984/_session';
// const pdbad = 'http://127.0.0.1:5984/_session';
const expiresIn = expiresAt =>
	Math.round(moment.duration(
		moment(expiresAt).diff(moment())
	).asSeconds());

const formatTokenResponse = (accessToken, refreshToken, user) => ({
	tokens: [{
		type: 'access',
		value: accessToken.value,
		expiresIn: expiresIn(accessToken.expiresAt),
	}, {
		type: 'refresh',
		value: refreshToken.value,
	}],
	user: {
		id: user.id,
	},
});

module.exports = {
	login(req, res) {
        var pouchDB = new PouchDB(pdbad, {skip_setup: true});
        const params = req.allParams();
        pouchDB.login(params.name, params.password, res, function(err, resp){
            if (err){
                return res.unauthorized();
            } else{
                return res.ok(resp);
            }
        });
	},

	refresh(req, res) {
		const params = req.allParams();

		// Verify the refresh token is assigned to the user
		return Tokens.findOne({
			user: params.user.id,
			value: params.token.value,
			type: 'refresh',
		}).exec((refreshTokenErr) => {
			if (refreshTokenErr) {
				return res.unauthorized();
			}

			// Destroy the current access token
			Tokens.destroy({
				user: params.user.id,
				type: 'access',
			}, (destroyErr) => {
				if (destroyErr) {
					return res.negotiate(destroyErr);
				}

				// Create a new access token
				return Tokens.findOrAdd({
					user: params.user,
					type: 'access',
				}, (accessTokenErr, accessToken) => {
					if (accessTokenErr) {
						return res.negotiate(accessTokenErr);
					}
					return res.ok(formatTokenResponse(accessToken, params.token, params.user));
				});
			});
		});
	},

	revoke(req, res) {
		const params = req.allParams();
		if (!params.tokens || !params.tokens.length) {
			return res.badRequest();
		}
		var counter = 0;

		params.tokens.forEach((token) => {
			Tokens.destroy({
				value: token.value,
				type: token.type,
				user: req.query.accessUser.id,
			}, (err) => {
				counter += 1;
				if (err) {
					return res.error();
				} else if (counter === params.tokens.length) {
					return res.ok();
				}
			});
		});
	},
};
