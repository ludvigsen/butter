define(["ui/webmakernav/webmakernav","login/babycornfield"],function(WebmakerBar, BabyCornField) {
	
	/**
	 * Handles the basic functionality for login page
	 */
	function LoginPage(){
		
	    var _this = this,
	    	_cornfield = new BabyCornField(),
	        _headerElement = document.querySelector(".login-header"),
	        _webmakerNavBar = _headerElement.querySelector( "#webmaker-nav" ),
	        _webmakerNav;
	    
	    /*** Header and Authentication ***/
	    _webmakerNav = new WebmakerBar({
	        container: _webmakerNavBar,
	        onLogin: authenticationRequired,
	        onLogout: logout
	    });
	    
	    function authenticationRequired( successCallback, errorCallback ) {
	        if ( _cornfield.authenticated() ) {
	            if ( successCallback && typeof successCallback === "function" ) {
	              successCallback();
	              return;
	            }
	          }

	          _cornfield.login( function( response ) {
	            if ( response.status === "okay" ) {
	              _webmakerNav.views.login( _cornfield.username() );
	              if ( successCallback && typeof successCallback === "function" ) {
	                successCallback();
	                return;
	              }
	            } else {
	              _this.showErrorDialog( "There was an error logging in. Please try again." );
	                if ( errorCallback && typeof errorCallback === "function" )  {
	                  errorCallback();
	                }
	            }
	          });
	    }
	    
	    function logout ( callback ) {
	        _cornfield.logout( function() {
	          _webmakerNav.views.logout();
	          if ( callback && typeof callback === "function" ) {
	            callback();
	          }
	        });
	      };
	}
	
	return LoginPage;
});