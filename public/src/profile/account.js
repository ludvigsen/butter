define([],function() {

	function Account(babycornfield,languages,organizations) {
		var _this = this,
        _email, _language_id, _organization_id,
        _isDirty = false;
		
		function invalidate() {
			// Account is dirty, needs save
			_isDirty = true;
		}
		
		
		Object.defineProperties( _this, {
	      "email": {
	        get: function() {
	          return _email;
	        },
	        set: function(value) {
	        	var org;
	        	if (value != _email) {
	        		_email = value;
	        		org = _this.getOrganizationForEmail(_email);
	        		if (org != null) {
	        			_organization_id = org.id;
	        		} else {
	        			_organization_id = null;
	        		}
	        	}
	        },
	        enumerable: true
	      },
	      "language_id": {
	    	  get: function() {
	    		  return _language_id;
	    	  },
	    	  set: function(value) {
	    		  if (value != _language_id) {
	    			  var i, num=languages.length;
	    			  for (i=0; i<num; i++) {
	    				  var language = languages[i];
		    				if (language.id === value) {
		    					_language_id = value;
		    					invalidate();
		    					return;
		    				}
	    			  }
	    		  }
	    	  },
	    	  enumerable: true
	      },
	      "organization_id": {
	    	  get: function() {
	    		  return _organization_id;
	    	  },
	    	  enumerable: true
	      }
		});
		
	    // Save account data.  Saving only happens if account data needs
	    // to be saved (i.e., it has been changed since last save, or was never
	    // saved before).
	    _this.save = function( callback ) {
	      if ( !callback ) {
	        callback = function() {};
	      }

	      // Don't save if there is nothing new to save.
	      if (!_isDirty ) {
	        callback({ error: "okay" });
	        return;
	      }

	      var accountData = {
	    	email: _email,
	    	language_id: _language_id,
	    	organization_id: _organization_id
	      };

	      // Save to db, then publish
	      babycornfield.saveAccount( accountData, function( e ) {
	        if ( e.error === "okay" ) {
	          _isDirty = false;

	          // Let consumers know that the account is now saved;
	          _this.dispatch( "accountsaved" );

	          callback( e );
	        } else {
	          callback( e );
	        }
	      });
	    };
		_this.getOrganizationForEmail = function(email) {
			var split = email.split('@');
			var domain;
			var i;
			var num = organizations.length;
			if (split.length == 2) {
				domain = split[1];
				for (i=0; i<num; i++) {
					var org = organizations[i];
					if (org.domain == domain) {
						return org;
					}
				}
			}
		}
	}
	return Account;
});
