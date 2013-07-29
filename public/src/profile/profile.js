define(["util/lang",
        "ui/webmakernav/webmakernav","./kettlecornfield",
        "dialog/dialog","dialogs",
        "text!./profile.html","text!./language_option.html",
        "text!./gettingstarted.html","text!./template_option.html",
        "text!./templates.json",
        "./account"],
        
        function(Lang,
        		WebmakerBar, KettleCornField, 
        		Dialog, dialogs,
        		PROFILE_LAYOUT, LANGUAGE_OPTION,
        		GETTING_STARTED, TEMPLATE_OPTION,
        		TEMPLATES,
        		Account) {
	
	/**
	 * Handles the basic functionality for login page
	 */
	function ProfilePage(){
		
	    var _this = this,
	    	_cornfield = new KettleCornField(),
	    	_instructionsElement = document.querySelector(".instructions"),
	        _headerElement = document.querySelector(".login-header"),
	        _getStartedElement = _instructionsElement.querySelector(".login"),
	        _webmakerNavBar = _headerElement.querySelector( "#webmaker-nav" ),
	        _profileHolderElement = document.querySelector(".profile"),
	        _templateListHolderElement = document.querySelector(".templates"),
	        _webmakerNav,
	        _templatesByOrganization = JSON.parse(TEMPLATES),
	        _templates,
	        _account = new Account(_cornfield);
	    
	    /*** Header and Authentication ***/
	    _webmakerNav = new WebmakerBar({
	        container: _webmakerNavBar,
	        onLogin: authenticationRequired,
	        onLogout: logout
	    });
	    
	    _getStartedElement.addEventListener("click",function(e) {
	    	authenticationRequired();
	    })
	    
	    this.views = {
	    	login: function(username) {
	    		_webmakerNav.views.login(username);
	    		_instructionsElement.style.display = "none";
	    	},
	    	logout: function() {
	    		_webmakerNav.views.logout();
	    		_instructionsElement.style.display = "";
		    	hideUserProfile();
		    	hideTemplateList();
	    	}
	    }
	    
	    function authenticationRequired( successCallback, errorCallback ) {
	        if ( _cornfield.authenticated() ) {
	            showUserLoggedIn();
	            if ( successCallback && typeof successCallback === "function" ) {
	              successCallback();
	              return;
	            }
	          }

	          _cornfield.login( function( response ) {
	            if ( response.status === "okay" ) {
	              showUserLoggedIn();
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
	          _this.views.logout();
	          if ( callback && typeof callback === "function" ) {
	            callback();
	          }
	        });
	      };
	    
	    /*** User Account and Template List Information ***/
	    function showUserLoggedIn() {
	    	_this.views.login( _cornfield.username() );
	    	// check to see if the user has a profile in the system
	    	_cornfield.getProfile(function(errorResponse) {
	    		if (errorResponse) {
	    			dialog = Dialog.spawn( "error-message", {
	    				data: errorResponse
	    			});
	    			dialog.open();
	    			return;
	    		}
	    		_account.email = _cornfield.email();
	    		if (_cornfield.hasProfile()) {
	    			_account.language_id = _cornfield.language_id();
	    			hideUserProfile();
	    		} else {
	    			showUserProfile();
	    		}
	    		showTemplateList();
	    	})
	    }
	    
	    function showUserProfile() {
	    	var organization, language, langOption, langInput, langLabel, organizationElement, languagesList,i,num,org,languages;
	        var _profileElement = Lang.domFragment( PROFILE_LAYOUT );
	    	organizationElement = _profileElement.querySelector('.profile-organization');
	    	organization = _account.getOrganizationForEmail(_cornfield.email());
	    	if (organization) {
	    		organizationElement.innerHTML = organization.name; 
	    	} else {
	    		organizationElement.innerHTML = 'Unrecognized Organization';
	    	}
	    	languagesList = _profileElement.querySelector('.profile-language-options');
	    	languages = _account.getLanguages();
	    	num = languages.length;
	    	for (i=0; i<num; i++) {
	    		language = languages[i];
	    		langOption = Lang.domFragment(LANGUAGE_OPTION);
	    		langInput = langOption.querySelector('input');
	    		langInput.value = language.id;
	    		langInput.addEventListener("click",function(e) {
	    			_account.language_id = e.target.value;
	    			_account.save();
	    		});
	    		langLabel = langOption.querySelector('label');
	    		langLabel.innerHTML = language.name;
	    		languagesList.appendChild(langOption);
	    	}
	    	_profileHolderElement.appendChild(_profileElement);
	    	_profileHolderElement.style.display = "";
	    	
	    }
	    
	    function hideUserProfile() {
	    	_profileHolderElement.style.display = "none";
	    	_profileHolderElement.innerHTML = '';
	    }
	   
	    function showTemplateList() {
    		var organizationId = _account.organziation_id;
    		var gettingStartedElement, templateElement, templateListElement, template, i, num, templateOption, templateImage;
    		
    		if (_account.organization_id) {
    			_templates = _templatesByOrganization[_account.organization_id];
    		} else {
    			_templates = _templatesByOrganization.other;
    		}
    		gettingStartedElement = Lang.domFragment(GETTING_STARTED);
    		templateListElement = gettingStartedElement.querySelector('ul.template-list');
    		num = _templates.length;
    		for (i=0; i<num; i++) {
    			template = _templates[i];
    			templateOption = Lang.domFragment(TEMPLATE_OPTION);
    			templateImage = templateOption.querySelector('img');
    			if (template.image && template.image.length > 0) {
    				templateImage.src = template.image;
    			} else {
    				templateImage.style.display = 'none';
    			}
    			templateOption.querySelector('.template-name').innerHTML = template.name;
    			templateOption.querySelector(".template-description").innerHTML = template.description;
    			templateOption.querySelector('a').href = template.url;
    			templateOption.querySelector('a').title = template.name;
    			templateListElement.appendChild(templateOption);
    		}
    		_templateListHolderElement.appendChild(gettingStartedElement);
	    	_templateListHolderElement.style.display = '';
	    }
	    
	    function hideTemplateList() {
	    	_templateListHolderElement.style.display = "none";
	    	_templateListHolderElement.innerHTML = '';
	    }
	    
	    // start in a logged out state.
	    // NOTE: This will need to change in order to auto-detect.
	    this.views.logout();
	    
	}
	
	return ProfilePage;
});