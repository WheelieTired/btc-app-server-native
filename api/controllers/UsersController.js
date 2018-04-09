/* global Users */
/**
 * UsersController
 */

module.exports = {
	create(req, res) {
		Users.add(req.allParams(), (err, user) => {
			if (err) {
				return res.negotiate(err);
			}
			return res.created({ user });
		});
	},

	get(req, res) {
		console.log("received the request");
		Users.find(req.allParams()).exec((err, users) => {
			console.log("You got got");
			if (err) {
				return res.negotiate(err);
			}
			return res.ok({ users });
		});
	},
};
