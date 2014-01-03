// PLUGIN: subtitles
(function (Popcorn) {

	/**
   * subtitles Popcorn plug-in
   * Based on popcorn.text.js by @humph
   * @param {Object} options
   *
   * Example:
//Sample spreadsheet: https://docs.google.com/spreadsheet/pub?key=0AiJKIpWZPRwSdF9wN1gxTlk0a2N5Z1JmT3ZzNl9xVnc&output=html
   **/

	var DEFAULT_FONT_COLOR = "#000000",
		DEFAULT_SHADOW_COLOR = "#444444",
		DEFAULT_BACKGROUND_COLOR = "#888888";

	/* toSeconds can be found in util time library  */
   
var loadedSpreadsheet;


//There's probably a better place to put this.
var lastFrameTime=-1,
	duration = 0,
	lastSubtitle=-1,
	container,
	innerDiv,
	innerContainer,
	subtitlesDataFromSpreadsheet,
	spreadsheetLoaded=false,
	directionClass="LTR";

function getCurrentSubtitle(time) {
	//subtitlesDataFromSpreadsheet
	var currentPin=-1;
	for (var i=0; i < loadedSpreadsheet.length; i++) {
		var aStartTime = loadedSpreadsheet[i].starttime;
		var aEndTime=loadedSpreadsheet[i].endtime;

		if (time >= aStartTime && time < aEndTime) { 
			currentPin=i;
		}
	}
	return currentPin;
}

//Here's how the Google Spreadsheet key is parsed for the maps plugin
	function parseQueryString ( fullUrl ) {
		var params = {}, queries, temp, i, l;

		var fullUrlObj=fullUrl.split("?");
		//console.log("parseQueryString with " + fullUrl);
		
		if (fullUrlObj.length < 2) {
			return params;
		}
		var queryString=fullUrlObj[1];
		// Split into key/value pairs
		queries = queryString.split("&");

		// Convert the array of strings into an object
		for ( i = 0, l = queries.length; i < l; i++ ) {
			temp = queries[i].split('=');
			params[temp[0]] = temp[1];
		}

		return params;
	};

//Loading the spreadsheet
	function loadSpreadsheet(lsUrl,lsCallback) {
		Popcorn.getJSONP(
			lsUrl,
			function( data ) {
				
				var entries=data.feed.entry;
				var arr=[];
				//we ingnore row 0 because it's the header vals
				for (i=0; i< entries.length; i++) {
					var o=entries[i];
					var contentStr=o.content["$t"];
					var r=parseSpreadsheetLine(contentStr);
					arr.push(r);
				}
				lsCallback(arr);
			} //end anonymous callback
		);
	}	//end loadSpreadsheet

//Parse spreadsheet
function parseSpreadsheetLine(str) {

		//the format returned from google's jsonp is TERRIBLE.  as a result we do some really ugly parsing
		//I originally had a more elegant solution but when values contain the delimiters (comma or semicolon) it wasn't working
		//console.log("PSL " + str);

		//var props=str.split(",");
		var newstr="";
		var o={};
		
		//endtime,title,description,lat,lng,zoom,thumbnail,openWindow

		/*
		i1=str.indexOf("starttime:")+10;
		i2=str.indexOf(", endtime",i1);
		o.starttimeString=trimString(str.substring(i1,i2))

		o.starttime=parseTimeStr(o.starttimeString);



		i1=str.indexOf("endtime:")+8;
		i2=str.indexOf(", title",i1);
		o.endtimeString=trimString(str.substring(i1,i2))
		o.endtime=parseTimeStr(o.endtimeString);

		
		i1=str.indexOf("title:")+6;
		i2=str.indexOf(", description",i1);
		o.title=trimString(str.substring(i1,i2))

		i1=str.indexOf("description:")+12;
		i2=str.indexOf(", lat",i1);
		o.description=trimString(str.substring(i1,i2))

		i1=str.indexOf("lat:")+4;
		i2=str.indexOf(", lng",i1);
		o.lat=trimString(str.substring(i1,i2))
		
		i1=str.indexOf("lng:")+4;
		i2=str.indexOf(", zoom",i1);
		o.lng=trimString(str.substring(i1,i2))

		i1=str.indexOf("zoom:")+5;
		i2=str.indexOf(", openwindow",i1);
		o.zoom=trimString(str.substring(i1,i2))

		i1=str.indexOf("openwindow:")+11;
		i2=str.indexOf(", showpin",i1);
		var openWindow=trimString(str.substring(i1,i2))
		o.openWindow=(openWindow.toLowerCase()=="true");
		
		i1=str.indexOf("showpin:")+8;
		i2=str.indexOf(", pinlabel",i1);
		var showPin=trimString(str.substring(i1,i2))
		o.showPin=(showPin.toLowerCase()=="true");
		
		i1=str.indexOf("pinlabel:")+9;
		i2=str.indexOf(", righttolefttext", i1);
		o.pinicon=trimString(str.substring(i1,i2))
		
		//Use a newer version of the spreadsheet
		i1=str.indexOf("righttolefttext:")+16;
		var isRTL=trimString(str.substring(i1));
		o.isRTL=(isRTL.toLowerCase()=="true");
*/
		i1=str.indexOf("starttime:")+10;
		i2=str.indexOf(", endtime",i1);
		o.starttimeString=trimString(str.substring(i1,i2))
		o.starttime=parseTimeStr(o.starttimeString);

		i1=str.indexOf("endtime:")+8;
		i2=str.indexOf(", subtitle",i1);
		o.endtimeString=trimString(str.substring(i1,i2))
		o.endtime=parseTimeStr(o.endtimeString);
		
		i1=str.indexOf("subtitle:")+9;
		i2=str.indexOf(", position",i1);
		o.subtitle=trimString(str.substring(i1,i2))

		i1=str.indexOf("position:")+9;
		i2=str.indexOf(", righttolefttext", i1);
		o.position=trimString(str.substring(i1,i2))
		
		i1=str.indexOf("righttolefttext:")+16;
		var isRTL=trimString(str.substring(i1));
		o.isRTL=(isRTL.toLowerCase()=="true");

		return o;
	}

//Trimming string
function trimString(str) {
		return str.replace(/^\s+|\s+$/g, '');
	};

//
function parseTimeStr(aStr) {
		var strArray=aStr.split(".");

		//parse the minutes and seconds from the left side of .
		var minutesAndSeconds=strArray[0];
		var minSecArray=minutesAndSeconds.split(":");
		var m=parseInt(minSecArray[0]);
		var s=parseInt(minSecArray[1]);
		
		//parse the milliseconds from the right side of .
		var ms=parseInt(strArray[1]);
		
		var totalTime=(m*60) + (s) + (ms/1000);
		return totalTime;

	}


  function toSeconds( time ) {
    var splitTime,
        seconds,
        minutes,
        hours,
        isNegative = 1;

    if ( typeof time === "number" ) {
      return time;
    }

    if ( typeof time !== "string" ) {
      return 0;
    }

    time = time.trim();
    if ( time.substring( 0, 1 ) === "-" ) {
      time = time.replace( "-", "" );
      isNegative = -1;
    }

    splitTime = time.split( ":" );
    seconds = +splitTime[ splitTime.length - 1 ] || 0;
    minutes = +splitTime[ splitTime.length - 2 ] || 0;
    hours = +splitTime[ splitTime.length - 3 ] || 0;

    seconds += hours * 3600;
    seconds += minutes * 60;

    return seconds * isNegative;
  }

	function newlineToBreak(string) {
		// Deal with both \r\n and \n
		return string.replace(/\r?\n/gm, "<br>");
	}

	Popcorn.plugin("subtitles", {

		manifest: {
			about: {
				name: "Popcorn subtitles Plugin",
				version: "0.1",
				author: "@drawinghands"
			},
			options: {
				text: {
					elem: "textarea",
					label: "Text",
					"default": "Subtitles..."
				},
				position: {
					elem: "select",
					options: ["Custom", "Middle", "Bottom", "Top"],
					values: ["custom", "middle", "bottom", "top"],
					label: "Text Position",
					"default": "bottom"
				},
				/*
				alignment: {
					elem: "select",
					options: ["Center", "Left", "Right"],
					values: ["center", "left", "right"],
					label: "Text Alignment",
					"default": "center"
				},
				*/
				start: {
					elem: "input",
					type: "text",
					label: "In",
					group: "advanced",
					"units": "seconds"
				},
				end: {
					elem: "input",
					type: "text",
					label: "Out",
					group: "advanced",
					"units": "seconds"
				},
				spreadsheetKey: {
					elem: "input",
					type:"text",
					label: "Google Spreadsheet URL",
					group:"advanced",
					"default":""
					//,tooltip: "0AiJKIpWZPRwSdFphbEI5UjJVdTRIc2RQQ1pXT2owN3c"
				},
				/*
				sheetNumber: {
					elem: "input",
					type:"text",
					label: "Sheet Number (optional)",
					group:"advanced",
					"default":""
					//,tooltip: "0AiJKIpWZPRwSdFphbEI5UjJVdTRIc2RQQ1pXT2owN3c"
				},
				*/
				top: {
					elem: "input",
					type: "number",
					label: "Top",
					units: "%",
					"default": 0,
					hidden: false,
					group: "advanced"
				},
				left: {
					elem: "input",
					type: "number",
					label: "Left",
					units: "%",
					"default": 25,
					hidden: false,
					group: "advanced"
				},
				width: {
					elem: "input",
					type: "number",
					units: "%",
					label: "Width",
					"default": 50,
					group: "advanced"
				},
				transition: {
					elem: "select",
					options: ["None", "Pop", "Fade", "Slide Up", "Slide Down"],
					values: ["popcorn-none", "popcorn-pop", "popcorn-fade", "popcorn-slide-up", "popcorn-slide-down"],
					label: "Transition",
					"default": "popcorn-fade",
          			group: "advanced"
				},
				fontFamily: {
					elem: "select",
					label: "Font",
					styleClass: "",
					googleFonts: true,
					group: "advanced",
					"default": "Merriweather"
				},
				fontSize: {
					elem: "input",
					type: "number",
					label: "Font Size",
					"default": 10,
					units: "%",
					group: "advanced"
				},
				isRTL: {
					elem: "input",
					type: "checkbox",
					label: "Right to Left Text",
					group:"advanced",
					"default": false,
					optional: true
				},	
				zindex: {
					hidden: true
				}
			}
		},

		_setup: function (options) {
			var target = Popcorn.dom.find(options.target),
				text = newlineToBreak(options.text),
				//container = options._container = document.createElement("div"),
				//innerContainer = document.createElement("div"),
				innerSpan = document.createElement("span"),
				//innerDiv = document.createElement("div"),
				fontSheet,
				position = options.position || options._natives.manifest.options.position["default"],
				//alignment = options.alignment,
				transition = options.transition || options._natives.manifest.options.transition["default"],
				link,
				context = this,
				that=this;

			//needed these two divs to be accessible elsewhere.
			container = options._container = document.createElement("div")
			innerContainer = document.createElement("div")
			innerDiv = document.createElement("div")

			if (!target) {
				target = this.media.parentNode;
			}

			options._target = target;
			container.style.position = "absolute";
			container.classList.add("popcorn-text");
			container.classList.add("popcorn-subtitles");

			// backwards comp
			if ("center left right".match(position)) {
				//alignment = position;
				position = "middle";
			}

			// innerDiv inside innerSpan is to allow zindex from layers to work properly.
			// if you mess with this code, make sure to check for zindex issues.
			innerSpan.appendChild(innerDiv);
			innerContainer.appendChild(innerSpan);
			container.appendChild(innerContainer);
			target.appendChild(container);

			// Add transition class
			// There is a special case where popup has to be added to the innerDiv, not the outer container.
			options._transitionContainer = (position !== "custom" && (transition === "popcorn-pop" || "popcorn-fade")) ? innerDiv : container;

			options._transitionContainer.classList.add(transition);
			options._transitionContainer.classList.add("off");

			// Handle all custom fonts/styling

			innerContainer.classList.add("text-inner-div");


			//var directionClass="LTR";
			if (options.isRTL) {
				directionClass="RTL";
			}
			innerContainer.classList.add(directionClass);

			fontSheet = document.createElement("link");
			fontSheet.rel = "stylesheet";
			fontSheet.type = "text/css";
			options.fontFamily = options.fontFamily ? options.fontFamily : options._natives.manifest.options.fontFamily["default"];
			

			// Store reference to generated sheet for removal later, remove any existing ones
			options._fontSheet = fontSheet;
			document.head.appendChild(fontSheet);

			fontSheet.onload = function () {
				innerContainer.style.fontFamily = options.fontFamily;
				innerContainer.style.fontSize = options.fontSize + "%";
				if (position === "custom") {
					container.classList.add("text-custom");
					//innerContainer.classList.add(alignment);
					container.style.left = options.left + "%";
					container.style.top = options.top + "%";
					if (options.width) {
						container.style.width = options.width + "%";
					}
					container.style.zIndex = +options.zindex;
				} else {
					container.classList.add("text-fixed");
					innerContainer.classList.add(position);
					//innerContainer.classList.add(alignment);
					innerDiv.style.zIndex = +options.zindex;
				}

				innerDiv.innerHTML = text; //sets the innerDiv text to the subtitle.
			};

			fontSheet.href = "//fonts.googleapis.com/css?family=" + options.fontFamily.replace(/\s/g, "+") + ":400,700";

			options.toString = function () {
				// use the default option if it doesn't exist
				return options.text || options._natives.manifest.options.text["default"];
			};


			//If they've entered a spreadsheet, find the key and load the spreadsheet.
			if (options.spreadsheetKey) {
				var qParams=parseQueryString(options.spreadsheetKey);
				var keyVal=qParams["key"];
				if (keyVal == null) {
					keyVal="";
				}
				//https://docs.google.com/spreadsheet/ccc?key=0AiJKIpWZPRwSdFphbEI5UjJVdTRIc2RQQ1pXT2owN3c&usp=drive_web#gid=0
				//experiment with gid=0
				//publish all sheets but try to access that one.
				var loc = "https://spreadsheets.google.com/feeds/list/" + keyVal + "/od6/public/values?alt=json-in-script&callback=jsonp";
				//console.log("request spreadsheet from " + loc);
				
				loadSpreadsheet(loc,function(lsData) {
					subtitlesDataFromSpreadsheet=lsData;

					console.log("===========================================")
					console.log(subtitlesDataFromSpreadsheet);
					loadedSpreadsheet=subtitlesDataFromSpreadsheet;

					spreadsheetLoaded=true;
					//title v. subtitle
					options.text="Subtitle: "+loadedSpreadsheet[0].subtitle; //This just gives the timeline layer a better title.
				})


			}
		},

		start: function (event, options) {
			var transitionContainer = options._transitionContainer,
				redrawBug;
			if (options.spreadsheetKey=="") {
				innerDiv.innerHTML = options.text
				if (transitionContainer) {
					transitionContainer.classList.add("on");
					transitionContainer.classList.remove("off");

					// Safari Redraw hack - #3066
					//transitionContainer.style.display = "none";
					//redrawBug = transitionContainer.offsetHeight;
					//transitionContainer.style.display = "";
				}
			}

			/*
			if (transitionContainer) {
				transitionContainer.classList.add("on");
				transitionContainer.classList.remove("off");

				// Safari Redraw hack - #3066
				transitionContainer.style.display = "none";
				redrawBug = transitionContainer.offsetHeight;
				transitionContainer.style.display = "";
			}*/

			lastFrameTime=-1;
			duration = options.end - options.start;
			console.log("Duration: "+duration);
		},


		frame: function(event, options, time){
			var t = time - options.start
			var transitionContainer = options._transitionContainer,
				redrawBug;

			//look in the google map plugin to see how this is handled. 

				if (lastFrameTime != time&&spreadsheetLoaded) {
					//don't continue to excecute If it's paused OR if we haven't finished loading the spreadsheet 
						var currentSubtitle=getCurrentSubtitle(time);

						if (lastSubtitle != currentSubtitle) {
							lastSubtitle=currentSubtitle;
							if (currentSubtitle != -1) {
								//title v. subtitle
								//var directionClass="LTR";
								if (loadedSpreadsheet[currentSubtitle].isRTL) {
									directionClass="RTL";
									innerContainer.classList.add(directionClass);
								}else{									
									innerContainer.classList.remove(directionClass);
								}

								//Trying to position the subtitle based on the spreadsheet.
								container.classList.add("text-fixed");
								innerContainer.classList.remove("bottom");
								innerContainer.classList.remove("top");
								innerContainer.classList.add("center");
								innerContainer.classList.add(loadedSpreadsheet[currentSubtitle].position);



								innerDiv.innerHTML =loadedSpreadsheet[currentSubtitle].subtitle;

								//Add the transition to fade IN the subtitle.
								transitionContainer.classList.add("on");
								transitionContainer.classList.remove("off");

								// Safari Redraw hack - #3066 ::: (NOTE: This causes the transitions not to render!!!)
								//transitionContainer.style.display = "none";
								//redrawBug = transitionContainer.offsetHeight;
								//transitionContainer.style.display = "";
							} else{
								//Add the transition to fade OUT the subtitle.								
								transitionContainer.classList.add("off");
								transitionContainer.classList.remove("on");
							}
						}
					//}
				}
				lastFrameTime=time; 
		},

		end: function (event, options) {
			if (options._transitionContainer) {
				options._transitionContainer.classList.remove("on");
				options._transitionContainer.classList.add("off");
			}
		},

		_teardown: function (options) {
			if (options._target) {
				options._target.removeChild(options._container);
			}

			if (options._fontSheet) {
				document.head.removeChild(options._fontSheet);
			}
		}
	});
}(window.Popcorn));