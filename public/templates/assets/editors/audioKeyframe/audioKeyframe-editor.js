/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

/*
	* audioKeyframe popcorn plug-in editor

	
*/

(function( Butter ) {
	Butter.Editor.register( "audioKeyframe", "load!{{baseDir}}templates/assets/editors/audioKeyframe/audioKeyframe-editor.html", function( rootElement, butter ) {
		var _this = this;
		var _rootElement = rootElement,
			_trackEvent,
			_butter,
			_popcornOptions;
		
		/**
		 * Member: setup
		 * Sets up the content of this editor 
		 * @param {TrackEvent} trackEvent: The TrackEvent being edited
		 */
		function setup( trackEvent ) {
			_trackEvent = trackEvent;
			_popcornOptions = _trackEvent.popcornOptions;
			var basicContainer = _rootElement.querySelector( ".editor-options" );
			var advancedContainer = _rootElement.querySelector( ".advanced-options" );
			var pluginOptions = {};
			var pickers = {};
			
			function callback( elementType, element, trackEvent, name ) {
				pluginOptions[ name ] = { element: element, trackEvent: trackEvent, elementType: elementType };
			}	//end function callback
			
			function attachHandlers() {
				var key,
					option;
				    
				function checkboxCallback( trackEvent, updateOptions, prop ) {
					trackEvent.update( updateOptions );
				}	//checkboxCallback
				
				for ( key in pluginOptions ) {
					if ( pluginOptions.hasOwnProperty( key ) ) {
						option = pluginOptions[ key ];
						if ( option.elementType === "select" ) {
							_this.attachSelectChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
						} else if (key=="volumeStart" || key=="volumeEnd") {
							//for whatever reason, couldn't check for option.type=="range".  so used key name.
							_this.attachSliderChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
						}
						else if ( option.elementType === "input" ) {
							if ( option.element.type === "checkbox" ) {
								_this.attachCheckboxChangeHandler( option.element, option.trackEvent, key, checkboxCallback );
							} else {
								_this.attachInputChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
							}
						}
						else if ( option.elementType === "textarea" ) {
							_this.attachInputChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
						}
					}
				}	//for ( key in pluginOptions ) {
				basicContainer.insertBefore( _this.createStartEndInputs( trackEvent, _this.updateTrackEventSafe ), basicContainer.firstChild );
			}	//end function attachHandlers()
			
			//now let's create the actual form fields inside of the basic and advanced tabs
			_this.createPropertiesFromManifest({
				trackEvent: trackEvent,
				callback: callback,
				basicContainer: basicContainer,
				advancedContainer: advancedContainer,
				ignoreManifestKeys: ["start","end"]
			});	//_this.createPropertiesFromManifest
		
			attachHandlers();
			_this.updatePropertiesFromManifest( trackEvent );
			_this.setTrackEventUpdateErrorCallback( _this.setErrorState );
		}	//end setup
		
		function onTrackEventUpdated( e ) {
			_trackEvent = e.target;
			
			_this.updatePropertiesFromManifest( _trackEvent );
			_this.setErrorState( false );
		}	//onTrackEventUpdated
		
		// Extend this object to become a TrackEventEditor
		Butter.Editor.TrackEventEditor.extend( _this, butter, rootElement, {
			open: function( parentElement, trackEvent ) {
				_butter = butter;
				// Update properties when TrackEvent is updated
				trackEvent.listen( "trackeventupdated", onTrackEventUpdated );
				setup( trackEvent );
			},	//open
			close: function() {
				_trackEvent.unlisten( "trackeventupdated", onTrackEventUpdated );
			}	//close
		});	//Butter.Editor.TrackEventEditor.extend
	});	//Butter.Editor.register .... function( rootElement, butter ) {
}( window.Butter ));	//(function( Butter ) {
