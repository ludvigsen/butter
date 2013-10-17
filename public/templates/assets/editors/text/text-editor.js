/* This Source Code Form is subject to the terms of the MIT license
* If a copy of the MIT license was not distributed with this file, you can
* obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

(function( Butter ) {

	Butter.Editor.register( "text", "load!{{baseDir}}templates/assets/editors/text/text-editor.html",
		function( rootElement, butter ) {

		var _this = this;

		var _rootElement = rootElement,
			_trackEvent,
			_butter,
			_popcornOptions,
			_falseClick = function() {
				return false;
			},
			_trueClick = function() {
				return true;
			};

		/**
		* Member: setup
		*
		* Sets up the content of this editor
		*
		* @param {TrackEvent} trackEvent: The TrackEvent being edited
		*/
		function setup( trackEvent ) {
			_trackEvent = trackEvent;
			_popcornOptions = _trackEvent.popcornOptions;

			var basicContainer = _rootElement.querySelector( ".editor-options" ),
				advancedContainer = _rootElement.querySelector( ".advanced-options" ),
				pluginOptions = {},
				pickers = {};

			function callback( elementType, element, trackEvent, name ) {
				pluginOptions[ name ] = { element: element, trackEvent: trackEvent, elementType: elementType };
			}

			function attachHandlers() {
				var key,
				option;

				function colorCallback( te, options, message, prop ) {
					var newOpts = {};
					if ( message ) {
						_this.setErrorState( message );
						return;
					} else {
						newOpts[ prop ] = options[ prop ];
						te.update( newOpts );
					}
				}
				function checkboxCallback( trackEvent, updateOptions, prop ) {
					if ( "background shadow".match( prop ) ) {
						if ( updateOptions[ prop ] ) {
							pickers[ prop ].classList.remove( "butter-disabled" );
							pickers[ prop ].onclick = _trueClick;
							pickers[ prop ].removeAttribute("disabled");
						} else {
							pickers[ prop ].classList.add( "butter-disabled" );
							pickers[ prop ].onclick = _falseClick;
							pickers[ prop ].setAttribute( "disabled", "true" );
						}
					}
					trackEvent.update( updateOptions );
				} //end checkboxCallback

				for ( key in pluginOptions ) {
					if ( pluginOptions.hasOwnProperty( key ) ) {
						option = pluginOptions[ key ];

						if ( option.elementType === "select" ) {
							_this.attachSelectChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
						} else if ( option.elementType === "input" ) {
							if ( key === "linkUrl" ) {
								_this.createTooltip( option.element, {
									name: "text-link-tooltip" + Date.now(),
									element: option.element.parentElement,
									message: "Links will be clickable when shared.",
									top: "105%",
									left: "50%",
									hidden: true,
									hover: false
								});
							}

							if ( option.element.type === "checkbox" ) {
								_this.attachCheckboxChangeHandler( option.element, option.trackEvent, key, checkboxCallback );
							} else if ( key === "fontColor" ) {
								_this.attachColorChangeHandler( option.element, option.trackEvent, key, colorCallback );
							} else if ( key === "backgroundColor" ) {
								pickers.background = option.element;
								// set initial state
								if ( !_popcornOptions.background ) {
									option.element.classList.add( "butter-disabled" );
									option.element.onclick = _falseClick;
									option.element.setAttribute( "disabled", "true" );
								}
								_this.attachColorChangeHandler( option.element, option.trackEvent, key, colorCallback );
							} else if ( key === "shadowColor" ) {
								pickers.shadow = option.element;
								// set initial state
								if ( !_popcornOptions.shadow ) {
									option.element.classList.add( "butter-disabled" );
									option.element.onclick = _falseClick;
									option.element.setAttribute( "disabled", "true" );
								}
								_this.attachColorChangeHandler( option.element, option.trackEvent, key, colorCallback );
							}
							else {
								_this.attachInputChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
							}
						} else if ( option.elementType === "textarea" ) {
							_this.attachInputChangeHandler( option.element, option.trackEvent, key, _this.updateTrackEventSafe );
						}
					} //end if pluginOptions.hasOwnProp
				} //end key in pluginOptions

				basicContainer.insertBefore( _this.createStartEndInputs( trackEvent, _this.updateTrackEventSafe ), basicContainer.firstChild );
			} //end attachhandlers


			function stripIt(str) {
				return str.replace(/<(?:.|\n)*?>/gm, '');
			}

			function runTranslator() {
				console.log("RUNNING TRANSLATOR");

				//var translateURL="http://oddi.bbg.gov/translation/index.php";
				var translateURL="/translatePhrase";
				
				var currentInstance=0;
				for ( var i in CKEDITOR.instances ){
					currentInstance = i;
				}


				var ckinstance=CKEDITOR.instances[currentInstance];
				var strToTranslate=ckinstance.getData();
				strToTranslate=stripIt(strToTranslate);

				//ckinstance.destroy(); 
				//TODO: REMOVE THE TOOLTIP
				console.log("BASIC CONTAINER");
				basicContainer.insertBefore(preloaderContainer, basicContainer.firstChild);
				preloaderContainer.style.display="";


				//set our textarea to readonly
				for (key in pluginOptions) {
					if (pluginOptions[key]) {
						var option = pluginOptions[key];
						if (option.elementType === "textarea") {
							var updateOptions={originalTextName:strToTranslate};
							_trackEvent.update(updateOptions);
							if (pluginOptions["text_original"]) {
								pluginOptions["text_original"].element.style.display="";
								pluginOptions["text_original"].element.originalTextLabel.style.display="";
							}
						}
					}
				}

				translationLang="es";
				translationLangName="Spanish";
				translationType="auto";

				if (window.Butter && window.Butter.app && window.Butter.app.kettlecornfield) { 
					translationLang=window.Butter.app.kettlecornfield.language_bing_code();
					translationLangName=window.Butter.app.kettlecornfield.language_name();
					var possibleTT=window.Butter.app.kettlecornfield.translationType();
					if (possibleTT && possibleTT =="hand") {
						translationType="hand";
					}
				}

				if (translationType == "auto") {
					preloaderBG.innerHTML="<BR><BR><strong style='font-size:2.0em;'>Translating to " + translationLangName + "</strong>";
					

					//var __csrfToken = document.querySelector("meta[name=X-CSRF-Token]").content;
					$.get("/api/whoami", function( response ) {
						__csrfToken = response.csrf;
						console.log("I AM " + __csrfToken);
						$.ajax({
							type: "POST",
							url: translateURL,
							data: {phrase:strToTranslate, lang:translationLang},
							headers: {"x-csrf-token":__csrfToken},
							dataType: "text",
							success: function(data){
								//translationPreloaderImg.style.display="none";
								preloaderContainer.style.display="none";
								var newData="<p>"+data+"</p>";
								ckinstance.setData(newData);
								var updateOptions={"text":newData, "text_original":strToTranslate};
								_trackEvent.update(updateOptions); 
								pluginOptions["text_original"].element.readOnly=true; 
								//pluginOptions["text_original"].element.originalTextLabel.value="Original Text"; 
							}
						}); 
					});
				} else {
					preloaderBG.innerHTML="<BR><BR><strong style='font-size:1.5em;'>Translation by hand!<BR><BR></strong></em>";
					setTimeout(function(){
						preloaderContainer.style.display="none";
						var newData="<p>Replace this text with your translation</p>";
						ckinstance.setData(newData);
						var updateOptions={"text":newData, "text_original":strToTranslate};
						_trackEvent.update(updateOptions); 
						pluginOptions["text_original"].element.readOnly=true; 
					},1000);
				}
			} //end runtranslator
			window.runTheTranslator=runTranslator;


			function addTranslationUI() {
				var useGrayButton=false;
				if (useGrayButton) {
					var btnTranslate= document.createElement('input');
					btnTranslate.setAttribute('type','button');
					btnTranslate.setAttribute('name','translate');
					btnTranslate.setAttribute('id','translate');
					btnTranslate.setAttribute('value','Translate Me');
					btnTranslate.addEventListener("click", runTranslator);
					basicContainer.insertBefore(btnTranslate, basicContainer.firstChild);
				}
					
				preloaderContainer = document.createElement( "div" );
				preloaderContainer.setAttribute('id','preloaderContainer');
				preloaderBG=document.createElement("div");
				preloaderBG.setAttribute('id','preloaderBG');
				
				preloaderBG.style.backgroundColor="rgba(0,0,0,0.9)";
				preloaderBG.style.width="100%";
				preloaderBG.style.height="100%";
				preloaderContainer.style.overflow="visible";
				preloaderBG.style.overflow="visible";

				preloaderContainer.style.width="100%";
				preloaderContainer.style.height="100%";
				preloaderContainer.style.zIndex =99999;
				preloaderContainer.setAttribute("id", "preloaderContainer");
				preloaderContainer.style.position="absolute";
				preloaderContainer.style.display="none";
				preloaderContainer.style.textAlign="center";
				
				preloaderBG.style.paddingTop="35%";
				preloaderBG.style.color="#FFFFFF";
				
				preloaderContainer.appendChild(preloaderBG); 
			}



			// backwards comp
			if ( "center left right".match( _popcornOptions.position ) ) {
				_popcornOptions.alignment = _popcornOptions.position;
				_popcornOptions.position = "middle";
			}

			var ignoreKeys = ["start","end"];
			if (trackEvent.manifest.options.text.editor === 'ckeditor') {
				ignoreKeys = ["start","end","alignment","linkUrl","fontFamily","fontSize","fontColor","background","backgroundColor","fontDecorations"];
			}
			_this.createPropertiesFromManifest({
				trackEvent: trackEvent,
				callback: callback,
				basicContainer: basicContainer,
				advancedContainer: advancedContainer,
				ignoreManifestKeys: ignoreKeys
			});

			attachHandlers();
			addTranslationUI();
			_this.updatePropertiesFromManifest( trackEvent );
			_this.setTrackEventUpdateErrorCallback( _this.setErrorState );
		}	//end setup

		function anchorClickPrevention( anchorContainer ) {
			if ( anchorContainer ) {
				anchorContainer.onclick = _falseClick;
			}
		}

		function onTrackEventUpdated( e ) {
			_trackEvent = e.target;

			var anchorContainer = _trackEvent.popcornTrackEvent._container.querySelector( "a" );
			anchorClickPrevention( anchorContainer );

			_this.updatePropertiesFromManifest( _trackEvent );
			_this.setErrorState( false );
		}

		// Extend this object to become a TrackEventEditor
		Butter.Editor.TrackEventEditor.extend( _this, butter, rootElement, {
			open: function( parentElement, trackEvent ) {
				var anchorContainer = trackEvent.popcornTrackEvent._container.querySelector( "a" );
				anchorClickPrevention( anchorContainer );
				_butter = butter;
				// Update properties when TrackEvent is updated
				trackEvent.listen( "trackeventupdated", onTrackEventUpdated );
				setup( trackEvent );
			},
			close: function() {
				_trackEvent.unlisten( "trackeventupdated", onTrackEventUpdated );
			}
		});
	});	// end Butter.Editor.register( "text", "load!{{baseDir}}templates/assets/editors/text/text-editor.html",
}( window.Butter ));
