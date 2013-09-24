/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */


/* Babycornfield is those portions from Cornfield that only apply to authentication.
 * This allows a separate login functionality to be used without instantiating the full "Butter" application.
 * This is specific to Kettlecorn
 */
define( [ "util/xhr","cornfield/module","./account" ], function( xhr, Cornfield, Account ) {

  /**
   * KettleCornField is a wrapper function for the cornfield module.  It adds the profile specific functionality of Kettlecorn.
   * It can be passed the main cornfield or instantiate a new one.  This allows us to take advantage of butter when available,
   * but still have authentication functionality without the full editor instantiation.
   */  //  function EventEditor( butter, moduleOptions, ButterNamespace ){
  var KettleCornField = function(butter_cornfield) {


    var hasProfile = false,
        organization_id = "",
        language_id = "",
        self = this,
        _email,
        _authenticated,
        _username,
        _name,
        NULL_FUNCTION = function() {},
        dummy = {listen: NULL_FUNCTION, unlisten: NULL_FUNCTION, dispatch: NULL_FUNCTION};
        //cornfield = butter_cornfield ? butter_cornfield : new Cornfield(dummy);
        //MODIFICATION JBF: Allow for the possibility that cornfield is actually in butter_cornfied.app.cornfield
        var cornfield;
        if (butter_cornfield) {     
	       	 if (butter_cornfield.app) {
	       		cornfield=butter_cornfield.app.cornfield;
	       	 } else {
	       		cornfield=butter_cornfield;
	         }
  		} else {
  			cornfield=new Cornfield(dummy);    //this happens, for instance, in the PROFILE.JS which creates a NEW kettlecornfield object (oddly)
  		}
        var _account = new Account(cornfield);
 


    this.login = function( callback ) {
      cornfield.login(callback);
    };
    
    this.getProfile = function(callback) {
    	//console.log("calling getProfile from KettleCornfield");
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
    			if (callback) {
    				callback();
    			}
    		}
    	});
    }
    
    this.autologin = function(callback) {
    	xhr.get( "/api/whoami", function( response ) {
    		if ( response.status === "okay" ) {
    			_authenticated = true;
    			_email = response.email;
    			_username = response.username;
    			_name = response.name;
    		}
    		
    		if ( callback ) {
    			callback( response );
    		}
    	});
    }

    this.email = function() {
      return cornfield.email() || _email;
    };

    this.name = function() {
      return cornfield.name() || _name;
    };

    this.username = function() {
      return cornfield.username() || _username;
    };

    this.authenticated = function() {
      return cornfield.authenticated() || _authenticated;
    };
    
    this.hasProfile = function() {
    	return hasProfile;
    }
    
    this.organization_id = function() {
    	return organization_id; 
    }
    this.organization_domain=function() {
		var i;
		var _organizations=_account.getOrganizations();
		var num = _organizations.length;
		var domain="NO_DOMAIN";
		for (i=0; i<num; i++) {
			var org = _organizations[i];
			if (org.id == organization_id) {
				domain=org.domain;
			}
		}
		return domain;
    } 
    this.language_bing_code=function() {
        console.log("language_bing_code");
        var i;
        var _languages=_account.getLanguages();
        var num = _languages.length;
        var code="";
        for (i=0; i<num; i++) {
            var theLang = _languages[i];
            if (theLang.id == language_id) {
                console.log("foound our id " + theLang.id);
                if (theLang.bingCode) {
                    code=theLang.bingCode;
                }
            }
        }
        console.log("returns code " + code );
        return code;
    }
    this.language_name=function() {
        console.log("language_name");
        var i;
        var _languages=_account.getLanguages();
        var num = _languages.length;
        var langName="";
        for (i=0; i<num; i++) {
            var theLang = _languages[i];
            if (theLang.id == language_id) {
                console.log("foound our id " + theLang.id);
                if (theLang.name) {
                    langName=theLang.name;
                }
            }
        }
        console.log("returns langName " + langName );
        return langName;
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
    //console.log("KettleCornfield is initializing, so let's call getProfile");
    this.getProfile();  

  };

  KettleCornField.__moduleName = "kettlecornfield";
  
  

  return KettleCornField;
});	//end define( [ "util/xhr","cornfield/module" ]
