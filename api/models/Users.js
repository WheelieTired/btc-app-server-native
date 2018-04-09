/* global PasswordService */
/**
* Users.js
*/
var PouchDB = require('pouchdb');
var pouchDB = new PouchDB('http://btc-admin:damsel-custard-tramway-ethanol@52.91.46.42:5984/_users');

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 30;

module.exports = {
	attributes: {
		firstName: {
			required: true,
		},

		lastName: {
		    required: true,
		},

		email: {
			required: true,
			unique: true,
			type: 'email',
		},

		password: {
			required: true,
			minLength: PASSWORD_MIN_LENGTH,
			maxLength: PASSWORD_MAX_LENGTH,
			type: 'string',
		},

		// Override toJSON method to remove password from API
		toJSON() {
			const obj = this.toObject();
			delete obj.password;
			return obj;
		},
	},

	validationMessages: {
		firstName: {
			required: 'First name is required.',
		},
		lastName: {
		    required: 'Last name is required.',
		},
		email: {
			required: 'Email address is required.',
			email: 'Email address is not valid.',
			unique: 'Email address already exists.',
		},
		password: {
			required: 'Password is required.',
			minLength: `Password is too short (min ${PASSWORD_MIN_LENGTH} characters).`,
			maxLength: `Password is too long (max ${PASSWORD_MAX_LENGTH} characters).`,
		},
	},

	beforeCreate(attrs, next) {
		PasswordService.encryptPassword(attrs.password).then((password) => {
			attrs.password = password; // This is the only way to assign the new encrypted password
			next();
		});
	},

	add(attrs, next) {

		const payload = {
		    _id: "org.couchdb.user:" + String(attrs.email).trim(),
		    type: "user",
		    name: String(attrs.email).trim(),
		    roles: [],
		    verified: false,
			first: String(attrs.firstName).trim(),
			email: String(attrs.email).trim(),
			password: String(attrs.password).trim(),
			last: String(attrs.lastName).trim(),
		};

		pouchDB.put(payload, function(err, body, header){
            if (err) {
                console.log('error:', err.message);
            }
            else{
                console.log('user successfully added 2');
            }
         });
	},

	find(attrs, next) {
		console.log("You made it");
		const id = "org.couchdb.user:" + String(attrs.email).trim();
		const payload = {
				_id: "org.couchdb.user:" + String(attrs.email).trim(),
				type: "user",
				name: String(attrs.email).trim(),
				roles: [],
				verified: false,
			email: String(attrs.email).trim(),
			password: String(attrs.password).trim(),
		};

		pouchDB.get(id, function(doc){
			return db.remove(doc);
		}).then( function (result){
			if (err) {
				console.log('error', err.message);
			}
			else{
				console.log('user got');
			}
			});
	},

};
