"use strict";
/**
 * Takes the profile model and runs database queries and functions against it
 */
module.exports = function( Profile ) {

  return {
    find: function( email, callback ) {
    	if ( !email ) {
    		callback( "Missing Email" );
	        return;
	    }
    	Profile.find(email).complete( callback );
    },

	  
    update: function updateProfile( options, callback ) {
      options = options || {};
      var email = options.email,
          language_id = options.language_id,
          organization_id = options.organization_id;

      if ( !email || !language_id ) {
        callback( "Expected email and language_id parameters to update" );
        return;
      }

      Profile.find(email)
      .success(function( profileData ) {
    	// create a new profile if null
        if ( !profileData ) {
          var profileData = Profile.build({
        	  email: email,
        	  language_id: language_id,
        	  organization_id: organization_id
          });

          profileData.save().complete( callback );
          return;
        } 
        
        // update profile
        profileData.updateAttributes({
          email: email,
          language_id: language_id,
          organization_id: organization_id
        })
        .error( function( err ) {
          callback( err );
        })
        .success( function( profileUpdateResult ) {
          callback( null, profileUpdateResult );
        });
      })
      .error(function( error ) {
        callback( error );
      });
    }
  };
};
