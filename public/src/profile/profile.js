define(["util/lang",
        "ui/webmakernav/webmakernav","./babycornfield",
        "dialog/dialog","dialogs",
        "text!./profile.html","text!./language_option.html",
        "text!./gettingstarted.html","text!./template_option.html",
        "core/config", "text!./languages.json","text!./organizations.json","text!./templates.json",
        "./account"],
        
        function(Lang,
        		WebmakerBar, BabyCornField, 
        		Dialog, dialogs,
        		PROFILE_LAYOUT, LANGUAGE_OPTION,
        		GETTING_STARTED, TEMPLATE_OPTION,
        		Config, LANGUAGES, ORGANIZATIONS, TEMPLATES,
        		Account) {
	
	/**
	 * Handles the basic functionality for login page
	 */
	function ProfilePage(){
		
	    var _this = this,
	    	_cornfield = new BabyCornField(),
	        _headerElement = document.querySelector(".login-header"),
	        _webmakerNavBar = _headerElement.querySelector( "#webmaker-nav" ),
	        _profileHolderElement = document.querySelector(".profile"),
	        _templateListHolderElement = document.querySelector(".templates"),
	        _webmakerNav,
	        _languageConfig = Config.parse(LANGUAGES),
	        _organizationConfig = Config.parse(ORGANIZATIONS),
	        _templateConfig = Config.parse(TEMPLATES),
	        _languages = _languageConfig.value('languages'),
	        _organizations = _organizationConfig.value('organizations'),
	        _templates,
	        _account = new Account(_cornfield,_languages,_organizations);
	    
	    /*** Header and Authentication ***/
	    _webmakerNav = new WebmakerBar({
	        container: _webmakerNavBar,
	        onLogin: authenticationRequired,
	        onLogout: logout
	    });
	    
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
	          showUserLoggedOut();
	          if ( callback && typeof callback === "function" ) {
	            callback();
	          }
	        });
	      };
	    
	    /*** User Account and Template List Information ***/
	    function showUserLoggedIn() {
            _webmakerNav.views.login( _cornfield.username() );
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
	    	var organization, language, langOption, langInput, langLabel, organizationElement, languagesList,i,num,org;
	        var _profileElement = Lang.domFragment( PROFILE_LAYOUT );
	    	organizationElement = _profileElement.querySelector('.profile-organization');
	    	organization = _account.getOrganizationForEmail(_cornfield.email());
	    	if (organization) {
	    		organizationElement.innerHTML = organization.name; 
	    	} else {
	    		organizationElement.innerHTML = 'Unrecognized Organization';
	    	}
	    	languagesList = _profileElement.querySelector('.profile-language-options');
	    	num = _languages.length;
	    	for (i=0; i<num; i++) {
	    		language = _languages[i];
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
    			_templates = _templateConfig.value(_account.organization_id);
    		} else {
    			_templates = _templateConfig.value("other");
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
	    
	    function showUserLoggedOut() {
	    	_webmakerNav.views.logout();
	    	hideUserProfile();
	    	hideTemplateList();
	    }
	    
	    // start in a logged out state.
	    // NOTE: This will need to change in order to auto-detect.
	    showUserLoggedOut();
	    
	}
	
	return ProfilePage;
});