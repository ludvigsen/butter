/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */


/* Babycornfield is those portions from Cornfield that only apply to authentication.
 * This allows a separate login functionality to be used without instantiating the full "Butter" application.
 * This is specific to Kettlecorn
 */
define( [ "util/xhr" ], function( xhr ) {

  /**
   * BabyCornField includes a subset of the information in the full cornfield module.
   * This includes only authentications stuff as well as profile updates specific to Kettlecorn implementation. 
   */
  var BabyCornField = function() {

    var authenticated = false,
    	hasProfile = false,
        email = "",
        name = "",
        username = "",
        organization_id = "",
        language_id = "",
        self = this;

    this.login = function( callback ) {
      navigator.id.get( function( assertion ) {
        if ( assertion ) {
          xhr.post( "/persona/verify", { assertion: assertion }, function( response ) {
            if ( response.status === "okay" ) {

              // Get email, name, and username after logging in successfully
              whoami( callback );
              return;
            }

            // If there was an error of some sort, callback on that
            callback( response );
          });
        } else {
          callback();
        }
      });
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
    			callback();
    		}
    	});
    }

    function whoami( callback ) {
      xhr.get( "/api/whoami", function( response ) {
        if ( response.status === "okay" ) {
          authenticated = true;
          email = response.email;
          username = response.username;
          name = response.name;
        }

        if ( callback ) {
          callback( response );
        }
      });
    }

    this.email = function() {
      return email;
    };

    this.name = function() {
      return name;
    };

    this.username = function() {
      return username;
    };

    this.authenticated = function() {
      return authenticated;
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
      xhr.post( "/persona/logout", function( response ) {
        authenticated = false;
        email = "";
        username = "";
        name = "";

        if ( callback ) {
          callback( response );
        }
      });
    };
    
    function saveAccountFunction (data, callback) {
    	var url = "/api/profile";
    	
    	xhr.post(url, data, function(response) {
    		
    		callback(response);
    	});
    }

    this.saveAccount = saveAccountFunction;

  };

  BabyCornField.__moduleName = "babycornfield";

  return BabyCornField;
});
