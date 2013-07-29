/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */


/* Babycornfield is those portions from Cornfield that only apply to authentication.
 * This allows a separate login functionality to be used without instantiating the full "Butter" application.
 * This is specific to Kettlecorn
 */
define( [ "util/xhr","cornfield/module" ], function( xhr, Cornfield ) {

  /**
   * KettleCornField is a wrapper function for the cornfield module.  It adds the profile specific functionality of Kettlecorn.
   * It can be passed the main cornfield or instantiate a new one.  This allows us to take advantage of butter when available,
   * but still have authentication functionality without the full editor instantiation.
   */
  var KettleCornField = function(butter_cornfield) {

    var hasProfile = false,
        organization_id = "",
        language_id = "",
        self = this,
        NULL_FUNCTION = function() {},
        dummy = {listen: NULL_FUNCTION, unlisten: NULL_FUNCTION, dispatch: NULL_FUNCTION},
        cornfield = butter_cornfield ? butter_cornfield : new Cornfield(dummy);

    this.login = function( callback ) {
      cornfield.login(callback);
    };
    
    this.getProfile = function(callback) {
    	xhr.get("/api/profile", function(response) {
    		if (response.error) {
    			if (response.error.substring(0,3) === "404") {
    				// user does not have a profile
    				if (callback) {
    					callback();
    				}
	    		} else {
	    			// error occurred
	    			if (callback) {
	    				callback(response.error);
	    			}
	    		}
    		} else {
    			hasProfile = true;
    			email = response.email;
    			language_id = response.language_id;
    			organization_id = response.organization_id;
    			callback();
    		}
    	});
    }

    this.email = function() {
      return cornfield.email();
    };

    this.name = function() {
      return cornfield.name();
    };

    this.username = function() {
      return cornfield.username();
    };

    this.authenticated = function() {
      return cornfield.authenticated();
    };
    
    this.hasProfile = function() {
    	return hasProfile;
    }
    
    this.organization_id = function() {
    	return organization_id;
    }
    
    this.language_id = function() {
    	return language_id;
    }

    this.logout = function(callback) {
    	cornfield.logout(callback);
    };
    
    function saveAccountFunction (data, callback) {
    	var url = "/api/profile";
    	
    	xhr.post(url, data, function(response) {
    		
    		callback(response);
    	});
    }

    this.saveAccount = saveAccountFunction;

  };

  KettleCornField.__moduleName = "kettlecornfield";

  return KettleCornField;
});
