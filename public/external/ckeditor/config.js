/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	
	config.baseFloatZIndex = 100000200; // has to be high enough to float over popcorn maker windows (z-index defined in /css/globals.less)
	//translate
	config.toolbarGroups = [
    	{ name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
    	{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
    	{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
    	{ name: 'links' },
    	{ name: 'styles' },
    	{ name: 'colors' },
    	{ name: 'translate'}
    ];
	config.removeButtons = 'Source,Save,NewPage,Preview,Print,Templates,PasteText,PasteFromWord,Strike,Blockquote,CreateDiv,Anchor,Underline,Subscript,Superscript,Indent,Outdent,NumberedList,BulletedList,Format';
	
	
	config.toolbarStartupExpanded=false;	// start the toolbar in collapsed mode 
	config.toolbarCanCollapse =true;		// also required for starting collapsed 
	
 
	//config.font_names = 'Merriweather;Gentium Book Basic;Lato;Vollkorn;Gravitas One;PT Sans;Open Sans;Bangers;Fredoka One;Covered By Your Grace;Coda';
	//config.font_names = 'Merriweather;Open Sans;Bangers;Fredoka One;Coda';
	
	config.font_names = 'Verdana;Trebuchet MS'; 
	myFonts = ['Merriweather', 'Open Sans', 'Bangers', 'Fredoka One', 'Coda'];
	for(var i = 0; i<myFonts.length; i++){
		config.font_names = config.font_names+';'+myFonts[i];
		myFonts[i] = 'http://fonts.googleapis.com/css?family='+myFonts[i].replace(' ','+');
	}
	config.contentsCss = ['/css/kettlecorn-editor.css'].concat(myFonts);
	
	config.extraPlugins = 'stylesheetparser,translate';
	config.stylesSet = []; // don't load the default style rules - only load from CSS
	//config.contentsCss = '/css/kettlecorn-editor.css'; // load the styling for standard elements as well as pre-defined class options
	
	config.fontSize_sizes = 'xx-small/.2em;x-small/.5em;small/.8em;medium/1em;large/1.2em;x-large/1.5em;xx-large/2em';
};
