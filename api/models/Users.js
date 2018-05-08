/* global PasswordService */
/**
* Users.js
*/

var jwt = require('jsonwebtoken');
var fs = require('fs');
var nodemailer = require('nodemailer');
var _ = require('underscore');
const transporter = nodemailer.createTransport();

const secret = 'secret';
const issuer = 'bicycletouringcompanion';

const algorithm = 'HS256';

const subject = 'Register Your Bicycle Touring Companion Account';
const mailAccount = 'no-reply@bicycletouringcompanion.com';

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

        const email = attrs.email;
        const roles = [];
        const verification = jwt.sign( { email , roles }, secret, { issuer, algorithm } );
        const token = verification;

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
			verification: verification,
		};

		pouchDB.put(payload, function(err, body, header){
            if (err) {
                console.log('error:', err.message);
            }
            else{
                console.log('user successfully added 2');
            }
         });

         const registrationTemplate = fs.readFileSync( './emailTemplates/registration.html', 'utf8' );
         const {first, last} = attrs;
         const assetDomain = 'http://localhost:1337';
         const api = 'http://localhost:1337';
         transporter.sendMail( {
                 from: mailAccount,
                 to: email,
                 subject: subject,
                 html: _.template( registrationTemplate )( { first, last, api, token, assetDomain } )
               } );
	},

	find(attrs, next) {
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
			}
			});
	},

	resetPassword(attrs, next) {
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
			}
			});

			const forgotPasswordTemplate = fs.readFileSync( './emailTemplates/forgotPassword.html', 'utf8' );
			const assetDomain = 'http://localhost:1337';
			const api = 'http://localhost:1337';
			transporter.sendMail( {
							from: mailAccount,
							to: email,
							subject: subject,
							html: _.template( registrationTemplate )( { api, token, assetDomain } )
						} );
	},

};
