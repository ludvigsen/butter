define( [ "text!dialog/dialogs/profile.html", "dialog/dialog", "util/xhr", "util/lang",
          "text!profile/languages.json", "text!profile/language_option.html"],
  function( LAYOUT_SRC, Dialog, xhr, Lang, LANGUAGES, LANGUAGE_OPTION ) {
	
    Dialog.register( "profile", LAYOUT_SRC, function ( dialog, data ) {
      var rootElement = dialog.rootElement,
      languagesListElement = rootElement.querySelector('.profile-language-options'),
      _languages = JSON.parse( LANGUAGES ).languages,
      num = _languages.length,
      i,
      language, 
      langInput,
      langOption,
      langLabel;
      
		num = _languages.length;
		for (i=0; i<num; i++) {
			language = _languages[i];
			langOption = Lang.domFragment(LANGUAGE_OPTION);
			langInput = langOption.querySelector('input');
			if (language.id == data.account.language_id) {
				langInput.checked = true;
			}
			langInput.value = language.id;
			langInput.addEventListener("click",function(e) {
				data.account.language_id = e.target.value;
				data.account.save();
			});
			langLabel = langOption.querySelector('label');
			langLabel.innerHTML = language.name;
			languagesListElement.appendChild(langOption);
		}
      
      dialog.enableCloseButton();
      dialog.assignEscapeKey( "default-close" );
    });
});
