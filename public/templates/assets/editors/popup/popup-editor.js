/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */
(function (Butter) {

	Butter.Editor.register("popup", "load!{{baseDir}}templates/assets/editors/popup/popup-editor.html",
		function (rootElement, butter) {

			var _this = this;

			var _rootElement = rootElement,
				_trackEvent,
				_manifestOptions,
				_butter,
				_popcornOptions;

			var preloaderContainer,
				translationLang;	

			/**
			 * Member: setup
			 * Sets up the content of this editor
			 * @param {TrackEvent} trackEvent: The TrackEvent being edited
			 */

			function setup(trackEvent) {
				_trackEvent = trackEvent;
				_manifestOptions = _trackEvent.manifest.options;
				_popcornOptions = _trackEvent.popcornOptions;

				var basicContainer = _rootElement.querySelector(".editor-options"),
					advancedContainer = _rootElement.querySelector(".advanced-options"),
					pluginOptions = {};

				function callback(elementType, element, trackEvent, name) {
					pluginOptions[name] = {
						element: element,
						trackEvent: trackEvent,
						elementType: elementType
					};
				}

				function attachHandlers() {
					var key,
						option;

					function togglePopup() {
						triangleObject.element.parentNode.style.display = "none";
						flipObject.element.parentNode.style.display = "none";
						//soundObject.element.parentNode.style.display = "block";
						iconObject.element.parentNode.style.display = "block";
					}

					function toggleSpeech() {
						triangleObject.element.parentNode.style.display = "block";
						flipObject.element.parentNode.style.display = "block";
						//soundObject.element.parentNode.style.display = "none";
						iconObject.element.parentNode.style.display = "none";
					}

					function attachTypeHandler(option) {
						option.element.addEventListener("change", function (e) {
							var elementVal = e.target.value,
								updateOptions = {},
								target;

							if (elementVal === "popup") {
								togglePopup();
							} else {
								toggleSpeech();
							}

							updateOptions.type = elementVal;
							option.trackEvent.update(updateOptions);

							// Attempt to make the trackEvent's target blink
							target = _butter.getTargetByType("elementID", option.trackEvent.popcornOptions.target);
							if (target) {
								target.view.blink();
							} else {
								_butter.currentMedia.view.blink();
							}
						}, false);
					}

					function colorCallback(te, prop, message) {
						if (message) {
							_this.setErrorState(message);
							return;
						} else {
							te.update({
								fontColor: prop.fontColor
							});
						}
					}

					for (key in pluginOptions) {
						if (pluginOptions[key]) {
							option = pluginOptions[key];

							if (key === "type") {
								var triangleObject = pluginOptions.triangle,
									//soundObject = pluginOptions.sound,
									iconObject = pluginOptions.icon,
									flipObject = pluginOptions.flip,
									currentType = option.trackEvent.popcornOptions.type;

								if (currentType === "popup") {
									togglePopup();
								} else {
									toggleSpeech();
								}

								attachTypeHandler(option);
							} else if (option.elementType === "select" && key !== "type") {
								_this.attachSelectChangeHandler(option.element, option.trackEvent, key, _this.updateTrackEventSafe);
							} else if (option.elementType === "input") {
								if (key === "linkUrl") {
									_this.createTooltip(option.element, {
										name: "text-link-tooltip" + Date.now(),
										element: option.element.parentElement,
										message: "Links will be clickable when shared.",
										top: "105%",
										left: "50%",
										hidden: true,
										hover: false
									});
								}

								if (option.element.type === "checkbox") {
									_this.attachCheckboxChangeHandler(option.element, option.trackEvent, key);
								} else if (key === "fontColor") {
									_this.attachColorChangeHandler(option.element, option.trackEvent, key, colorCallback);
								} else {
									_this.attachInputChangeHandler(option.element, option.trackEvent, key, _this.updateTrackEventSafe);
								}
							} else if (option.elementType === "textarea") {
								_this.attachInputChangeHandler(option.element, option.trackEvent, key, _this.updateTrackEventSafe);
							}
						}
					}

					basicContainer.insertBefore(_this.createStartEndInputs(trackEvent, _this.updateTrackEventSafe), basicContainer.firstChild);
				}

				if (_popcornOptions.fontSize) {
					_manifestOptions.fontPercentage.hidden = true;
					_manifestOptions.fontSize.hidden = false;
				} else {
					_manifestOptions.fontSize.hidden = true;
					_manifestOptions.fontPercentage.hidden = false;
				}

				function stripIt(str) {
					return str.replace(/<(?:.|\n)*?>/gm, '');
				}



				function runTranslator() {
					console.log("RUNNING TRANSLATOR");

					//basicContainer.insertBefore(translationPreloaderImg, basicContainer.firstChild); 

					var translateURL="http://oddi.bbg.gov/translation/index.php";
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
								pluginOptions["text_original"].element.style.display="";
								pluginOptions["text_original"].element.originalTextLabel.style.display="";
							}
						}
					}

					translationLang="es";
					translationLangName="Spanish";
					if (window.Butter && window.Butter.app && window.Butter.app.kettlecornfield) { 
						translationLang=window.Butter.app.kettlecornfield.language_bing_code();
						translationLangName=window.Butter.app.kettlecornfield.language_name();
					}
					preloaderBG.innerHTML="<BR><BR><strong style='font-size:2.0em;'>Seasoning the corn...<BR><BR></strong><em>(translating to " + translationLangName + ")</em>";
					

					$.post(translateURL, {phrase:strToTranslate, lang:translationLang},
						function(data){
							//translationPreloaderImg.style.display="none";
							preloaderContainer.style.display="none";
							var newData="<p>"+data+"</p>";
							ckinstance.setData(newData);
							var updateOptions={"text":newData, "text_original":strToTranslate};
							_trackEvent.update(updateOptions); 
							pluginOptions["text_original"].element.readOnly=true; 
							//pluginOptions["text_original"].element.originalTextLabel.value="Original Text"; 
						}, 
					"text");
				}


				function addTranslationUI() {
					var btnTranslate= document.createElement('input');
					btnTranslate.setAttribute('type','button');
					btnTranslate.setAttribute('name','translate');
					btnTranslate.setAttribute('id','translate');
					btnTranslate.setAttribute('value','Translate Me');
					btnTranslate.addEventListener("click", runTranslator);
					basicContainer.insertBefore(btnTranslate, basicContainer.firstChild);
					
						
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
					
					/*
					preloaderText = document.createElement( "div" );
					preloaderText.innerHTML="<BR><BR><strong>Hello World!</strong>";
					preloaderText.style.color="0xFFFFFF";
					*/

					preloaderContainer.appendChild(preloaderBG); 
					//preloaderContainer.appendChild(preloaderText); 
					/*
					translationPreloaderImg = new Image(); 
					translationPreloaderImg.src = "/templates/assets/images/loader_circle.gif";
					preloaderContainer.appendChild(translationPreloaderImg); 
					*/

					
					
					console.log("inside the container");
				}
				

				var ignoreKeys = ["start", "end", "sound"];
				if (trackEvent.manifest.options.text.editor === 'ckeditor') {
					ignoreKeys = ["start", "end", "sound", "linkUrl", "fontFamily", "fontSize", "fontColor", "fontPercentage", "fontDecorations"];
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
				_this.updatePropertiesFromManifest(trackEvent);
				_this.setTrackEventUpdateErrorCallback(_this.setErrorState);
			}

			function anchorClickPrevention(anchorContainer) {
				if (anchorContainer) {
					anchorContainer.onclick = function () {
						return false;
					};
				}
			}

			function onTrackEventUpdated(e) {
				_trackEvent = e.target;

				var anchorContainer = _trackEvent.popcornTrackEvent._container.querySelector("a");
				anchorClickPrevention(anchorContainer);

				_this.updatePropertiesFromManifest(_trackEvent);
				_this.setErrorState(false);
			}

			// Extend this object to become a TrackEventEditor
			Butter.Editor.TrackEventEditor.extend(_this, butter, rootElement, {
				open: function (parentElement, trackEvent) {
					var anchorContainer = trackEvent.popcornTrackEvent._container.querySelector("a");

					anchorClickPrevention(anchorContainer);

					_butter = butter;

					// Update properties when TrackEvent is updated
					trackEvent.listen("trackeventupdated", onTrackEventUpdated);
					setup(trackEvent);
				},
				close: function () {
					_trackEvent.unlisten("trackeventupdated", onTrackEventUpdated);
				}
			});
		});
}(window.Butter));