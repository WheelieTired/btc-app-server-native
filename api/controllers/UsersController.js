/* global Users */
/**
 * UsersController
 */
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));
const pdbad = 'http://btc-admin:damsel-custard-tramway-ethanol@52.91.46.42:5984/_session';

module.exports = {
	create(req, res) {
		Users.add(req.allParams(), (err, user) => {
			if (err) {
				return res.negotiate(err);
			}
			return res.created({ user });
		});
	},

	changePassword(req, res) {
		var pouchDB = new PouchDB(pdbad, {skip_setup: true});
		const params = req.allParams();

		pouchDB.login(params.email, params.password, function (err, response) {
		  if (err) {
		    if (err.name === 'unauthorized') {
		      console.log("incorrect username or password");
					return res.unauthorized();
		    } else {
		      // cosmic rays, a meteor, etc.
					console.log("error with login");
					console.log(err);
					return res.unauthorized();
		    }
		  } else{
				pouchDB.changePassword(params.email, params.newPassword, res, function(err, resp){
					if (err) {
						if (err.name === 'not_found') {
							console.log("user not properly auth");
						}else {
							console.log("cannot change password");
							console.log(err);
							return res.unauthorized();
						}
					} else {
						return res.ok(resp);
					}
				});
			}
		});
		// Users.changePassword(req.allParams()).exec((err, users) => {
		// 	console.log("You got got");
		// 	if (err) {
		// 		return res.negotiate(err);
		// 	}
		// 	return res.ok({ users });
		// });
	},
};
