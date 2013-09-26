/**
 * Basic sample plugin inserting current date and time into CKEditor editing area.
 *
 * Created out of the CKEditor Plugin SDK:
 * http://docs.ckeditor.com/#!/guide/plugin_sdk_intro
 */

// Register the plugin within the editor.
CKEDITOR.plugins.add( 'translate', {

	// Register the icons. They must match command names.
	icons: 'timestamp',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {

		// Define an editor command that inserts a timestamp.
		editor.addCommand( 'translateSomething', {

			// Define the function that will be fired when the command is executed.
			exec: function( editor ) {
				var now = new Date();

				// Insert the timestamp into the document.
				var timeStr='The current date and time is: <em>' + now.toString() + '</em>.';
				//editor.insertHtml(timeStr); 
				window.runTheTranslator();
				//window.Butter.runTheTranslator();
			}
		});

		// Create the toolbar button that executes the above command.
		editor.ui.addButton( 'Timestamp', {
			label: 'Translate Text',
			command: 'translateSomething',
			toolbar: 'translate'
		});
	}
});