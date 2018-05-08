/* global Users */
/**
 * UsersController
 */
const generator = require('generate-password');
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-authentication'));
const pdbad = 'http://btc-admin:damsel-custard-tramway-ethanol@52.91.46.42:5984/_session';
const adminUsername = "btc-admin";
const adminPassword = "damsel-custard-tramway-ethanol";

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
	},

	resetPassword(req, res) {
		var pouchDB = new PouchDB(pdbad, {skip_setup: true});
		const params = req.allParams();

		var password = generator.generate({
		    length: 10,
		    numbers: true
		});

		pouchDB.login(adminUsername, adminPassword, function (err, response) {
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
				pouchDB.changePassword(params.email, password, res, function(err, resp){
					if (err) {
						if (err.name === 'not_found') {
							console.log("user not properly auth");
							return res.unauthorized();
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
	},
};
