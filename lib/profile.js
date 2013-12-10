"use strict";
/**
 * Takes the profile model and runs database queries and functions against it
 */
module.exports = function (Profile) {

	return {
		find: function (email, callback) {
			if (!email) {
				callback("Missing Email");
				return;
			}
			//Profile.find(email).complete(callback);
			Profile.find({
				where: ['email=?',email]
			})
			.complete(callback);
		},

		update: function updateProfile(options, callback) {
			options = options || {};
			var email = options.email,
				language_id = options.language_id,
				organization_id = options.organization_id,
				translationType = options.translationType,
				twitterHandle=options.twitterHandle,
				displayName=options.displayName;
				
			//we've had a problem getting sequelize to take a default value, so putting this here for now
			if (!translationType) {
				translationType="bing";
			}
			if (!language_id) {
				language_id="";
			}
			if (!email || !translationType) {	//|| we used to check !language_id  but now we allow users to not start with a languageID
				callback("Expected email and language_id and translationType parameters to update");
				return;
			}
			Profile.find({
				where: ['email=?',email]
			})
				.success(function (profileData) {
					// create a new profile if null
					if (!profileData) {
						var profileData = Profile.build({
							email: email,
							language_id: language_id,
							organization_id: organization_id,
							displayName: displayName,
							twitterHandle:twitterHandle
						});
						profileData.save().complete(callback);
						return;
					}

					// update profile
					profileData.updateAttributes({
						email: email,
						language_id: language_id,
						organization_id: organization_id,
						translationType: translationType,
						displayName: displayName,
						twitterHandle:twitterHandle
					})
						.error(function (err) {
							callback(err);
						})
						.success(function (profileUpdateResult) {
							callback(null, profileUpdateResult);
						});
				})
				.error(function (error) {
					callback(error);
				});
		}
	};
};