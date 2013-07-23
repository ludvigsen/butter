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
        email = "",
        name = "",
        username = "",
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

  };

  BabyCornField.__moduleName = "babycornfield";

  return BabyCornField;
});
