/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	
	config.baseFloatZIndex = 100000200; // has to be high enough to float over popcorn maker windows (z-index defined in /css/globals.less)
	
	config.toolbarGroups = [
    	{ name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
    	{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
    	{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
    	{ name: 'links' },
    	{ name: 'styles' },
    	{ name: 'colors' }
    ];
	config.removeButtons = 'Source,Save,NewPage,Preview,Print,Templates,PasteText,PasteFromWord,Strike,RemoveFormat,Blockquote,CreateDiv,Anchor,Underline,Subscript,Superscript,Indent,Outdent,NumberedList,BulletedList,Format';
		
	config.font_names = 'Merriweather;Gentium Book Basic;Lato;Vollkorn;Gravitas One;PT Sans;Open Sans;Bangers;Fredoka One;Covered By Your Grace;Coda';
	
	config.extraPlugins = 'stylesheetparser';
	config.stylesSet = []; // don't load the default style rules - only load from CSS
	config.contentsCss = '/css/kettlecorn-editor.css'; // load the styling for standard elements as well as pre-defined class options
};
