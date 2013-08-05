/**
 * Utility for handling text from wysiwyg editors.
 */
define( [], function() {

  var EditorCleanup = {
      cleanCKEditorText: function cleanCKEditorText( htmlString ) {
    	  var cleanedText = htmlString;
    	  // remove any line break characters from the text as the CKEditor returns HTML but plugins will attempt to convert any additional breaks into <br> tags 
    	  // adding additional space that was unintended by the end user.
    	  cleanedText = cleanedText.replace(/\r?\n/gm,'');
		  return cleanedText;
      }
  };

  return EditorCleanup;

});
