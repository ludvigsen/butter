"use strict";
/**
 * Takes the account model and runs database queries and functions against it
 */
module.exports = function( Account ) {
  function getUserAccount( email, callback ) {
    Account.find(email).complete(callback);
  }

  return {
    find: function( email, callback ) {
    	if ( !email ) {
    		callback( "Missing Email" );
	        return;
	    }
    	Account.find(email).complete( callback );
    },

	  
    update: function updateProject( options, callback ) {
      options = options || {};
      var email = options.email,
          language_id = options.language_id,
          organization_id = options.organization_id;

      if ( !email || !language_id || !organization_id ) {
        callback( "Expected email, language_id, and organization_id parameters to update" );
        return;
      }

      Account.find(email)
      .success(function( account ) {
    	// create a new account if null
        if ( !account ) {
          var account = Account.build({
        	  email: email,
        	  language_id: data.language.id,
        	  organization_id: data.organization.id
          });

          account.save().complete( callback );
          return;
        } 
        
        // update account
        account.updateAttributes({
          email: email,
          language_id: language_id,
          organization_id: organization_id
        })
        .error( function( err ) {
          callback( err );
        })
        .success( function( accountUpdateResult ) {
          callback( null, accountUpdateResult );
        });
      })
      .error(function( error ) {
        callback( error );
      });
    }
  };
};
