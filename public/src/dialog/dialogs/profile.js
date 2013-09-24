define( [ "text!dialog/dialogs/profile.html", "dialog/dialog", "util/xhr", "util/lang",
          "text!profile/languages.json", "text!profile/language_option.html", "text!profile/language_select_option.html"],
  function( LAYOUT_SRC, Dialog, xhr, Lang, LANGUAGES, LANGUAGE_OPTION, LANGUAGE_SELECT_OPTION) {
	
    Dialog.register( "profile", LAYOUT_SRC, function ( dialog, data ) {
      var rootElement = dialog.rootElement,
      languagesSelectElement=rootElement.querySelector('.profile-language-select'),
      _languages = JSON.parse( LANGUAGES ).languages,
      i,
      language, 
      langSelectOption,
      langSelectLabel,
      savingDiv=rootElement.querySelector('#saving'),
      organizationDiv=rootElement.querySelector('#organization');

      function saveAccount() {
      		data.account.save(function(response) { 
				
				
				function hideTheDiv() {
					savingDiv.style.display="none";
				}
				savingDiv.innerHTML="SAVE COMPLETE";
				setTimeout(hideTheDiv,500); 

				//now that the save is complete, we want to be sure that we come back fresh in the main editr
				if (window.Butter && window.Butter.app && window.Butter.app.kettlecornfield) {
					window.Butter.app.kettlecornfield.getProfile();
				}
			});
      }
  
  	//CREATE OUR 'LANGUAGES' DROPDOWN
	for (i=0; i<_languages.length; i++) {
		language = _languages[i];

		if (_languages[i].enableTranslation=="true") {

			langSelectOption=Lang.domFragment(LANGUAGE_SELECT_OPTION);
			langSelectInput=langSelectOption.querySelector('option');
			if (language.id == data.account.language_id) {
				langSelectInput.setAttribute("selected",true);
			}
			langSelectInput.value=language.id;
			
			langSelectInput.innerHTML=language.name;
			languagesSelectElement.appendChild(langSelectInput);
		}
	}

	//make sure not to put this inside the languages loop, as it will end up getting called once per lang!
	languagesSelectElement.addEventListener("change", function(e) {
		savingDiv.innerHTML="SAVING...";
		savingDiv.style.display="";
		data.account.language_id = e.target.value;
		saveAccount();
	});

	//UPDATE OUR 'ORGANIZATION' DISPLAY
	organizationDiv.innerHTML=data.account.organization_id;

      
      dialog.enableCloseButton();
      dialog.assignEscapeKey( "default-close" );
    });
});
