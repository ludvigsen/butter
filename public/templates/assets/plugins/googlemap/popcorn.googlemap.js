// PLUGIN: Google Maps
/*global google*/
var googleCallback;
(function (Popcorn) {

	// We load our own cached copy of this in order to deal with mix-content (http vs. https).
	// At some point the stamen API is going to change, and this will break.
	// We'll need to watch for this. NOTE: if you change the location of this file, the path
	// below needs to reflect that change.
	var STAMEN_BUTTER_CACHED_URL = "/external/stamen/tile.stamen-1.2.0.js";

	var _mapFired = false,
		_mapLoaded = false,
		// Store location objects in case the same string location is used multiple times.
		_cachedGeoCode = {},
		MAP_FAILURE_TIMEOUT = 100,
		geocoder,
		_mapCompletelyLoaded;

	//google api callback
	window.googleCallback = function (data) {
		// ensure all of the maps functions needed are loaded
		// before setting _maploaded to true
		if (typeof google !== "undefined" && google.maps && google.maps.Geocoder && google.maps.LatLng) {
			geocoder = new google.maps.Geocoder();
			Popcorn.getScript(STAMEN_BUTTER_CACHED_URL, function () {
				_mapLoaded = true;
			});
		} else {
			setTimeout(function () {
				googleCallback(data);
			}, 10);
		}
	};
	// function that loads the google api

	function loadMaps() {
		// for some reason the Google Map API adds content to the body
		if (document.body) {
			_mapFired = true;
			Popcorn.getScript("//maps.google.com/maps/api/js?sensor=false&callback=googleCallback");
		} else {
			setTimeout(function () {
				loadMaps();
			}, 10);
		}
	}

	function buildMap(options, mapDiv, pluginInstance) {
		var type = options.type ? options.type.toUpperCase() : "ROADMAP",
			layer;

		// See if we need to make a custom Stamen map layer
		if (type === "STAMEN-WATERCOLOR" ||
			type === "STAMEN-TERRAIN" ||
			type === "STAMEN-TONER") {
			// Stamen types are lowercase
			layer = type.replace("STAMEN-", "").toLowerCase();
		}

		var map = new google.maps.Map(mapDiv, {
			// If a custom layer was specified, use that, otherwise use type
			mapTypeId: layer ? layer : google.maps.MapTypeId[type],
			// Hide the layer selection UI
			mapTypeControlOptions: {
				mapTypeIds: []
			},
			streetViewControl: false,
			panControl: false
		});

		// Used to notify any users of the plugin when the maps has completely loaded
		google.maps.event.addListenerOnce(map, "idle", function () {
			_mapCompletelyLoaded=true;
			pluginInstance.emit("googlemaps-loaded");
		});

		if (layer) {
			map.mapTypes.set(layer, new google.maps.StamenMapType(layer));
		}

		return map;
	}	//end buildMap

	function formatInfoWindowString (title,description, isRTL) {
		
		var contentString = "";
		if (title != "" || description != "") {
			var rtlClass="";
			if (!isRTL) {
				
				contentString = '<div id="mapInfoWindow" mapLTR>'+
							'<p class="gmap_infoWindowTitle" mapLTR>' + title + '</p>'+
							'<p class="gmap_infoWindowDesc" mapLTR>' + description+ '</p>'+
							'</div>';
			} else { 
				

				//console.log("we have an rtl string for title " + title);
				contentString = '<div id="mapInfoWindow mapRTL">'+
							'<p class="gmap_infoWindowTitle mapRTL">' + title + '</p>'+
							'<p class="gmap_infoWindowDesc mapRTL">' + description+ '</p>'+
							'</div>';
			}
		}
		return contentString;
	}

	//http://www.joezimjs.com/javascript/3-ways-to-parse-a-query-string-in-a-url/
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



	function trimString(str) {
		return str.replace(/^\s+|\s+$/g, '');
	};
	
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

	function parseSpreadsheetLine(str) {

		//the format returned from google's jsonp is TERRIBLE.  as a result we do some really ugly parsing
		//I originally had a more elegant solution but when values contain the delimiters (comma or semicolon) it wasn't working
		//console.log("PSL " + str);

		var props=str.split(",");
		var newstr="";
		var o={};
		
		//endtime,title,description,lat,lng,zoom,thumbnail,openWindow

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
		
		i1=str.indexOf("righttolefttext:")+16;
		var isRTL=trimString(str.substring(i1));
		o.isRTL=(isRTL.toLowerCase()=="true");
		


		return o;
	}

	function getCurrentPinFromTime(md,time) {
		//mapDataFromSpreadsheet
		var currentPin=-1;
		for (var i=0; i < md.length; i++) {
			var aStartTime = md[i].starttime;
			var aEndTime=md[i].endtime;
			//console.log("looking at " + aStartTime + " TO " + aEndTime);
			if (time >= aStartTime && time < aEndTime) { 
				currentPin=i+1;
			}
		}
		//console.log(time + "... returns " + currentPin);
		return currentPin;

	}

	/**
   * googlemap popcorn plug-in
   * Adds a map to the target div centered on the location specified by the user
   * Options parameter will need a start, end, target, type, zoom, lat and lng, and location
   * -Start is the time that you want this plug-in to execute
   * -End is the time that you want this plug-in to stop executing
   * -Target is the id of the DOM element that you want the map to appear in. This element must be in the DOM
   * -Type [optional] either: HYBRID (default), ROADMAP, SATELLITE, TERRAIN, STREETVIEW, or one of the
   *                          Stamen custom map types (http://http://maps.stamen.com): STAMEN-TONER,
   *                          STAMEN-WATERCOLOR, or STAMEN-TERRAIN.
   * -Zoom [optional] defaults to 10
   * -Heading [optional] STREETVIEW orientation of camera in degrees relative to true north (0 north, 90 true east, ect)
   * -Pitch [optional] STREETVIEW vertical orientation of the camera (between 1 and 3 is recommended)
   * -Lat and Lng: the coordinates of the map must be present if location is not specified.
   * -Height [optional] the height of the map, in "px" or "%". Defaults to "100%".
   * -Width [optional] the width of the map, in "px" or "%". Defaults to "100%".
   * -Location: the adress you want the map to display, must be present if lat and lng are not specified.
   * Note: using location requires extra loading time, also not specifying both lat/lng and location will
   * cause and error.
   *
   * Tweening works using the following specifications:
   * -location is the start point when using an auto generated route
   * -tween when used in this context is a string which specifies the end location for your route
   * Note that both location and tween must be present when using an auto generated route, or the map will not tween
   * -interval is the speed in which the tween will be executed, a reasonable time is 1000 ( time in milliseconds )
   * Heading, Zoom, and Pitch streetview values are also used in tweening with the autogenerated route
   *
   * -tween is an array of objects, each containing data for one frame of a tween
   * -position is an object with has two paramaters, lat and lng, both which are mandatory for a tween to work
   * -pov is an object which houses heading, pitch, and zoom paramters, which are all optional, if undefined, these values default to 0
   * -interval is the speed in which the tween will be executed, a reasonable time is 1000 ( time in milliseconds )
   *
   * @param {Object} options
   *
   * Example:
   var p = Popcorn("#video")
   .googlemap({
    start: 5, // seconds
    end: 15, // seconds
    type: "ROADMAP",
    target: "map"
   } )
   *
   */
	Popcorn.plugin("googlemap", function (options) {
		// if this is defined, this is an update and we can return early.
		if (options._map) {
			return;
		}

		var outerdiv, innerdiv, map, location, 
			marker, infoWindow,
			target = Popcorn.dom.find(options.target),
			that = this,
			spreadsheetMode=false,
			pinMode=false,
			ranOnce = false,
			mapDataFromSpreadsheet,
			markersFromSpreadsheet=[],
			originalZoom;

		
		function geoCodeCallback(results, status) {
			// second check for innerdiv since it could have disappeared before
			// this callback is actually run
			if (!innerdiv) {
				return;
			}

			if (status === google.maps.GeocoderStatus.OK) {
				options.lat = results[0].geometry.location.lat();
				options.lng = results[0].geometry.location.lng();
				_cachedGeoCode[options.location] = location = results[0].geometry.location;

				map = buildMap(options, innerdiv, that);
			} else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
				setTimeout(function () {
					// calls an anonymous google function called on separate thread
					geocoder.geocode({
						"address": options.location
					}, geoCodeCallback);
				}, MAP_FAILURE_TIMEOUT);
			} else {
				// Some other failure occured
				console.warn("Google maps geocoder returned status: " + status);
			}
		}

		// ensure that google maps and its functions are loaded
		// before setting up the map parameters
		var isMapReady = function () {
			if (_mapLoaded) {
				if (innerdiv) {
					if (options.location) {
						location = _cachedGeoCode[options.location];

						if (location) {
							map = buildMap(options, innerdiv, that);


						} else {
							// calls an anonymous google function called on separate thread
							geocoder.geocode({
								"address": options.location
							}, geoCodeCallback);
						}

					} else {
						location = new google.maps.LatLng(options.lat, options.lng);
						map = map = buildMap(options, innerdiv, that);
					}

					if (map) {
						google.maps.event.addDomListener(window, 'resize', function() {
				          //TODO: add logic here to 'fake' having the info windows be responsive to the width of the browser
				          //console.log("window resized " + mapDiv.width);
				          //infowindow.open(map);
				        });
					}

				}
			} else {
				setTimeout(function () {
					isMapReady();
				}, 5);
			}
		};


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
		
		function removeExistingMarkersFromMap() {
			mfs=markersFromSpreadsheet;
			for (var i=0; i < mfs.length; i++) {
				var m=mfs[i];
				m.setMap(null);
			}
			mfs=[];
		}



		function placeMarkersWhenMapReady(mapDataFromSpreadsheet) {
			//needs vars _mapCompletelyLoaded, mapDataFromSpreadsheet,map,that
			if (_mapCompletelyLoaded) {
				var md=mapDataFromSpreadsheet;
				for (var i=0; i < md.length; i++) {
					var ev=md[i];
					var aMarker;

					if (ev.icon != "" && ev.icon != "default") {
						aMarker= new google.maps.Marker({
							position: new google.maps.LatLng(ev.lat, ev.lng), 
							title: 'MARKERTITLE',
							animation: google.maps.Animation.DROP,
							icon: "/templates/assets/images/mapicons/"+ev.pinicon+".png"
						});
					} else {
						aMarker= new google.maps.Marker({
							position: new google.maps.LatLng(ev.lat, ev.lng), 
							title: 'MARKERTITLE',
							animation: google.maps.Animation.DROP
						});
					}					
					
					if (!ev.showPin) {
						//console.log("hide pin " + i);
						aMarker.setMap(null);
					} else {
						aMarker.setMap(map);	
					}		
					//console.log("isRTL IS " + aMarker.isRTL);		
					
					markersFromSpreadsheet.push(aMarker);
					aMarker.markerNum=i;
					google.maps.event.addListener(aMarker, 'click', function() {
						var cmData=mapDataFromSpreadsheet[this.markerNum]
						//console.log("go to marker " + this.markerNum + " with time " + cmData.starttime);
						
						if (cmData.title != "" || cmData.description != "") {
							if (infowindow != null) {
								infowindow.setContent(formatInfoWindowString(cmData.title,cmData.description,cmData.isRTL)); 
								infowindow.open(map,aMarker);
							}
						}

						that.currentTime( cmData.starttime )
					});

				}
			} else {
				setTimeout(function () {
					placeMarkersWhenMapReady(mapDataFromSpreadsheet);
				}, 50);
			}
		}

		return {
			_setup: function (options) {
		
				originalZoom=options.zoom;
				
				if (options.spreadsheetKey) {
					var qParams=parseQueryString(options.spreadsheetKey);
					var keyVal=qParams["key"];
					if (keyVal == null) {
						keyVal="";
					}
					//https://docs.google.com/spreadsheet/ccc?key=0AiJKIpWZPRwSdFphbEI5UjJVdTRIc2RQQ1pXT2owN3c&usp=drive_web#gid=0
					var loc = "https://spreadsheets.google.com/feeds/list/" + keyVal + "/od6/public/values?alt=json-in-script&callback=jsonp";
					//console.log("request spreadsheet from " + loc);
					
					loadSpreadsheet(loc,function(lsData) {
						mapDataFromSpreadsheet=lsData;
						//create all of our markers and infoWindows.  
						placeMarkersWhenMapReady(mapDataFromSpreadsheet);
					})
				}

				lastFrameTime=-1;
				lastPinNum=-1;
				duration = options.end - options.start;
				//console.log("gMap setup");
				if (!target) {
					target = that.media.parentNode;
				}

				options._target = target;

				options.type = options.type || "ROADMAP";
				options.lat = options.lat || 0;
				options.lng = options.lng || 0;

				// if this is the first time running the plugins
				// call the function that gets the sctipt
				if (!_mapFired) {
					loadMaps();
				}

				// create a new div this way anything in the target div is left intact
				// this is later passed on to the maps api
				innerdiv = document.createElement("div");
				innerdiv.style.width = "100%";
				innerdiv.style.height = "100%";

				outerdiv = document.createElement("div");
				outerdiv.id = Popcorn.guid("googlemap");
				outerdiv.style.width = options.width + "%";
				outerdiv.style.height = options.height + "%";
				outerdiv.style.left = options.left + "%";
				outerdiv.style.top = options.top + "%";
				outerdiv.style.zIndex = +options.zindex;
				outerdiv.style.position = "absolute";
				outerdiv.classList.add(options.transition);
				outerdiv.classList.add("off");

				outerdiv.appendChild(innerdiv);
				options._container = outerdiv;

				if (target) {
					target.appendChild(outerdiv);
				}

				isMapReady();

				options.toString = function () {
					if (options.type === "STREETVIEW") {
						return "Streeview";
					}
					return options.location || ((options.lat && options.lng) ? options.lat + ", " + options.lng : options._natives.manifest.options.location["default"]);
				};
			},
			/**
			 * @member googlemap
			 * The start function will be executed when the currentTime
			 * of the video reaches the start time provided by the
			 * options variable
			 */
			start: function (event, options) {
				//console.log("gMap start");
				var that = this,
					sView,
					redrawBug,
					MAX_MAP_ZOOM_VALUE = 22,
					MAX_MAP_PITCH_VALUE = 12,
					MAX_MAP_HEADING_VALUE = 12,
					DEFAULT_MAP_ZOOM_VALUE = options._natives.manifest.options.zoom["default"],
					DEFAULT_MAP_PITCH_VALUE = options._natives.manifest.options.pitch["default"],
					DEFAULT_MAP_HEADING_VALUE = options._natives.manifest.options.heading["default"];

				// ensure the map has been initialized in the setup function above

				//isMapSetup defines function tween, and then
				var isMapSetup = function () {

					//REMOVED FUNCTION TWEEN
					function tween(rM, t) {
						var computeHeading = google.maps.geometry.spherical.computeHeading;
						setTimeout(function () {

							var current_time = that.media.currentTime;

							//  Checks whether this is a generated route or not
							if (typeof options.tween === "object") {

								for (var i = 0, m = rM.length; i < m; i++) {

									var waypoint = rM[i];

									//  Checks if this position along the tween should be displayed or not
									if (current_time >= (waypoint.interval * (i + 1)) / 1000 &&
										(current_time <= (waypoint.interval * (i + 2)) / 1000 ||
											current_time >= waypoint.interval * (m) / 1000)) {

										sView3.setPosition(new google.maps.LatLng(waypoint.position.lat, waypoint.position.lng));

										sView3.setPov({
											heading: waypoint.pov.heading || computeHeading(waypoint, rM[i + 1]) || 0,
											zoom: waypoint.pov.zoom || 0,
											pitch: waypoint.pov.pitch || 0
										});
									}
								}

								//  Calls the tween function again at the interval set by the user
								tween(rM, rM[0].interval);
							} else {

								for (var k = 0, l = rM.length; k < l; k++) {

									var interval = options.interval;

									if (current_time >= (interval * (k + 1)) / 1000 &&
										(current_time <= (interval * (k + 2)) / 1000 ||
											current_time >= interval * (l) / 1000)) {

										sView2.setPov({
											heading: computeHeading(rM[k], rM[k + 1]) || 0,
											zoom: options.zoom,
											pitch: options.pitch || 0
										});
										sView2.setPosition(checkpoints[k]);
									}
								}

								tween(checkpoints, options.interval);
							}
						}, t);
					} //end function tween

					if (map && !ranOnce) {
						options._map = map;
						ranOnce = true;
						// reset the location and zoom just in case the user played with the map
						outerdiv.classList.remove("off");
						outerdiv.classList.add("on");
						google.maps.event.trigger(map, "resize");
						map.setCenter(location);

						if (options.spreadsheetKey  && trimString(options.spreadsheetKey) != "") {
							pinMode=false;
							spreadsheetMode=true;
						} else  {
							pinMode=true;
							spreadsheetMode=false;
						}

						//we use the same infowindow the entire time, regardless of whether we're in spreadsheet mode or pin mode
						infowindow = new google.maps.InfoWindow({
							content: "",
							maxWidth:283
						});

						
						//infoWindowIsRTL, 

						infowindow.setContent(formatInfoWindowString(options.infoWindowTitle,options.infoWindowDesc,options.infoWindowIsRTL));

						if (pinMode) {						
							marker = new google.maps.Marker({
								position: location,
								title: 'MARKERTITLE',
								animation: google.maps.Animation.DROP
							});
							google.maps.event.addListener(marker, 'click', function() {
								
								if (infowindow.getContent() != "") {
									infowindow.open(map,marker);
								}
							});
							marker.setMap(map);
							if (options.infoWindowOpen) {
								if (infowindow.getContent() != "") {
									infowindow.open(map,marker);
								}
							}
						}

						// make sure options.zoom is a number
						if (options.zoom && typeof options.zoom !== "number") {
							options.zoom = +options.zoom >= 0 && +options.zoom <= MAX_MAP_ZOOM_VALUE ? +options.zoom : DEFAULT_MAP_ZOOM_VALUE;
						}

						map.setZoom(options.zoom);

						//Make sure heading is a number
						if (options.heading && typeof options.heading !== "number") {
							options.heading = +options.heading >= 0 && +options.heading <= MAX_MAP_HEADING_VALUE ? +options.heading : DEFAULT_MAP_HEADING_VALUE;
						}
						//Make sure pitch is a number
						if (options.pitch && typeof options.pitch !== "number") {
							options.pitch = +options.pitch >= 0 && +options.pitch <= MAX_MAP_PITCH_VALUE ? +options.pitch : DEFAULT_MAP_PITCH_VALUE;
						}

						if (options.type === "STREETVIEW") {
							map.setStreetView(
								sView = new google.maps.StreetViewPanorama(innerdiv, {
									position: location,
									pov: {
										heading: options.heading,
										pitch: options.pitch,
										zoom: options.zoom
									},
									enableCloseButton: false
								})
							);

							if (options.location && typeof options.tween === "string") {

								var sView2 = sView;
								var checkpoints = [];
								var directionsService = new google.maps.DirectionsService();
								var directionsDisplay = new google.maps.DirectionsRenderer(sView2);
								var request = {
									origin: options.location,
									destination: options.tween,
									travelMode: google.maps.TravelMode.DRIVING
								};
								directionsService.route(request, function (response, status) {
									if (status === google.maps.DirectionsStatus.OK) {
										directionsDisplay.setDirections(response);
										showSteps(response, that);
									}
								});

								var showSteps = function (directionResult) {
									var routes = directionResult.routes[0].overview_path;
									for (var j = 0, k = routes.length; j < k; j++) {
										checkpoints.push(new google.maps.LatLng(routes[j].lat(), routes[j].lng()));
									}
									options.interval = options.interval || 1000;
									tween(checkpoints, 10);
								};
							} else if (typeof options.tween === "object") {
								var sView3 = sView;
								for (var i = 0, l = options.tween.length; i < l; i++) {
									options.tween[i].interval = options.tween[i].interval || 1000;
									tween(options.tween, 10);
								}
							}
						}

						// For some reason, in some cases the map can wind up being undefined at this point
						if (options.onmaploaded && map) {
							options.onmaploaded(options, map);
						}

					} else if (ranOnce) {	//if map & have ranOnce
						outerdiv.classList.remove("off");
						outerdiv.classList.add("on");

						// Safari Redraw hack - #3066
						outerdiv.style.display = "none";
						redrawBug = outerdiv.offsetHeight;
						outerdiv.style.display = "";
					} else {	//else if ranOnce
						setTimeout(function () {
							isMapSetup();
						}, 50);
					}	//else
				};  //end isMapSetup
				isMapSetup();
			},	//end start
			
			frame: function(event, options, time) {
		        var scale = 1, opacity = 1,
		          t = time - options.start,
		          div = options.container,
		          transform;

				//console.log("FRAME " + time); 
				if (lastFrameTime != time) {
					//console.log("run frame at " + time);
					if (mapDataFromSpreadsheet) {	//we may not yet have finished loading the spreadsheet so let's make sure it exists
						var currentPin=getCurrentPinFromTime(mapDataFromSpreadsheet,time);
						var percentPlayed=time/duration; 
						if (lastPinNum != currentPin) {
							lastPinNum=currentPin;
							if (currentPin != -1) {
								var thisPin=mapDataFromSpreadsheet[currentPin-1];
								if (thisPin && google) {
									//console.log("GOTO PIN " + currentPin + " lat=" + thisPin.lat + " lng=" + thisPin.lng + " zoom=" + thisPin.zoom + " title " + thisPin.title);
									var newLocation=new google.maps.LatLng(thisPin.lat, thisPin.lng);
									//this is coming up NULL at times...why?
									map.panTo(newLocation);
									map.setZoom(parseInt(thisPin.zoom));
									if (thisPin.openWindow) {
										infowindow.setPosition(newLocation);
										infowindow.setContent(formatInfoWindowString(thisPin.title,thisPin.description,thisPin.isRTL)); 
										
										if (infowindow.getContent() != "") {
											infowindow.open(map,markersFromSpreadsheet[currentPin-1]);
										}
									} else {
										infowindow.close();
									}
								}
							} else {
								//this scenario is if we hit a time period that's not covered by spreadsheet.  
								if (infowindow) {
									infowindow.close();
								}

								/*
								map.panTo(location);	
								infowindow.close();
								map.setZoom(originalZoom);
								*/

							}
						}
					}
				}
				lastFrameTime=time;
		        if (!options.container) {
		          return;
		        }

		     },

			end: function () {
				// if the map exists hide it do not delete the map just in // case the user seeks back to time b/w start and end
				//console.log("gMap end");
				if (map) {
					outerdiv.classList.remove("on");
					outerdiv.classList.add("off");
				}
			},
			_teardown: function (options) {
				//console.log("gMap _teardown");
				// the map must be manually removed
				options._target.removeChild(outerdiv);
				innerdiv = map = location = null;
				options._map = null;
			},
			_update: function (trackEvent, options) {
				//update fires when you change a value in the editor pane
				//NOTE: Options in THIS function only contains properties that have CHANGED
				//console.log("the update function in google map plugin is firing");
				var updateLocation = false,
					map = trackEvent._map,
					triggerResize = false,
					ignoreValue = false,
					clearLocation = false,
					layer,
					oldType;
				
				var newTitle=("infoWindowTitle" in options);
				var newDesc=("infoWindowDesc" in options); 
				var newInfoWindowOpen = ("infoWindowOpen" in options); 
				var newSpreadskeetKey= ("spreadsheetKey" in options); 
				var newInfoWindowIsRTL = ("infoWindowIsRTL" in options); 
				
				//if they toggled either the title or description, we have to redraw the bubble's contents
				if (newTitle || newDesc || newInfoWindowIsRTL) {
					var iTitle=trackEvent.infoWindowTitle;
					var iDesc=trackEvent.infoWindowDesc;
					var iInfoWindowIsRTL=trackEvent.infoWindowIsRTL;
					if (newTitle) {
						iTitle=options.infoWindowTitle;
						trackEvent.infoWindowTitle=options.infoWindowTitle;	
					}
					if (newDesc) {
						iDesc=options.infoWindowDesc;
						trackEvent.infoWindowDesc=options.infoWindowDesc;
					}
					if (newInfoWindowIsRTL) {
						iInfoWindowIsRTL=options.infoWindowIsRTL;
						trackEvent.infoWindowIsRTL=options.infoWindowIsRTL;
					}
					//console.log("options2 is " + iInfoWindowIsRTL);
					
					infowindow.setContent(formatInfoWindowString(iTitle,iDesc,iInfoWindowIsRTL)); 
				}

				//if they toggled either the checkbox, show or hide the bubble
				if (newInfoWindowOpen) {
					if (options.infoWindowOpen) {
						if (infowindow.getContent() != "") {
							infowindow.open(map,marker);
						}
					} else {
						infowindow.close(); 
					}
				} 

				//if they added or removed the spreadsheet key, update appropriately
				if (newSpreadskeetKey) {
					removeExistingMarkersFromMap()
					if (options.spreadsheetKey != "") {
						//in this case, we either added a spreadsheet key when we didn't have one, or we changed the spreadsheet key
						//reload the spreadsheet then place the markers again

						//get rid of everything currently on the map
						infowindow.close();
						if (marker) {
							marker.setMap(null);
						}

						var qParams=parseQueryString(options.spreadsheetKey);
						var keyVal=qParams["key"];
						if (keyVal == null) {
							keyVal="";
						}
						var loc = "https://spreadsheets.google.com/feeds/list/" + keyVal + "/od6/public/values?alt=json-in-script&callback=jsonp";
						//console.log("request spreadsheet from " + loc);
					

						loadSpreadsheet(loc,function(lsData) {
							mapDataFromSpreadsheet=lsData;
							placeMarkersWhenMapReady(mapDataFromSpreadsheet);
						})

					} else {
						/* in this case we removed a spreadsheet key while in editor.  
						   We are thus reverting to whatever is stored for location
						*/
						if (marker==null) {
							marker = new google.maps.Marker({
								position: location,
								title: 'MARKERTITLE',
								animation: google.maps.Animation.DROP
							});
							if (trackEvent.infoWindowOpen) {
								if (infowindow.getContent() != "") {
									infowindow.open(map,marker);
								}
							} else {
								infowindow.close();
							}
						}						
						marker.setMap(map);
						marker.setPosition(location);
						map.panTo(location);
					}
				} 
				

				function streetViewSearch(latLng, res, errorMsg, toggleMaps, success) {
					var streetViewService = new google.maps.StreetViewService();
					streetViewService.getPanoramaByLocation(latLng, res, function (data, status) {
						if (status === google.maps.StreetViewStatus.OK) {
							success(data.location.latLng);
						} else {
							that.emit("googlemaps-zero-results", {
								error: errorMsg,
								toggleMaps: toggleMaps
							});
						}
					});
				}	//streetViewSearch

				if (options.type && options.type !== trackEvent.type) {
					oldType = trackEvent.type;

					if (options.type !== "STREETVIEW") {
						trackEvent.type = options.type;
						if (oldType === "STREETVIEW") {
							map.streetView.setVisible(false);
						}
						if (/STAMEN/.test(trackEvent.type)) {
							layer = trackEvent.type.toLowerCase();
						}
						map.setMapTypeId(layer ? layer : google.maps.MapTypeId[trackEvent.type]);
						if (layer) {
							map.mapTypes.set(layer, new google.maps.StamenMapType(layer.replace("stamen-", "")));
						}
					} else {
						ignoreValue = true;
						trackEvent.location = "";

						streetViewSearch(
							map.getCenter(),
							5000,
							"There is no Street View data available within 5 kilometres of your map's centre. Try moving the map and selecting Street View again.",
							true,
							function (latLng) {
								trackEvent.type = options.type;
								trackEvent.heading = 0;
								trackEvent.pitch = 0;
								trackEvent.zoom = options.zoom;
								map.streetView.setVisible(true);
								map.streetView.setPosition(latLng);
								map.streetView.setPov({
									heading: trackEvent.heading,
									pitch: trackEvent.pitch,
									zoom: trackEvent.zoom
								});
							}
						);
					}
				}

				if (!ignoreValue && options.zoom && options.zoom !== trackEvent.zoom) {
					trackEvent.zoom = options.zoom;

					if (trackEvent.type !== "STREETVIEW") {
						map.setZoom(+trackEvent.zoom);
					} else {
						map.streetView.setPov({
							heading: trackEvent.heading,
							pitch: trackEvent.pitch,
							zoom: +trackEvent.zoom
						});
					}

				}

				if (!ignoreValue && options.location && options.location !== trackEvent.location) {
					updateLocation = true;
					location = _cachedGeoCode[options.location];
					trackEvent.location = options.location;
					if (location) {
						if (trackEvent.type === "STREETVIEW") {
							streetViewSearch(
								location,
								250,
								false,
								"There is no Street View data available within 250 metres of the searched location. Try another location",
								function (latLng) {
									map.streetView.setPosition(latLng);
								}
							);
						} else {
							map.panTo(location);
						}
					} else {
						geocoder.geocode({
							"address": trackEvent.location
						}, function (results, status) {
							if (status === google.maps.GeocoderStatus.OK) {
								_cachedGeoCode[trackEvent.location] = location = results[0].geometry.location;
								if (trackEvent.type === "STREETVIEW") {
									streetViewSearch(
										location,
										250,
										"There is no Street View data available within 250 metres of the searched location. Try another location",
										false,
										function (latLng) {
											map.streetView.setPosition(latLng);
										}
									);
								} else {

									if (pinMode) { 
										marker.setPosition(location);
									}

									map.panTo(location);
								}
							}
						});
					}
				}

				if (!ignoreValue && !updateLocation && options.lat && options.lat !== trackEvent.lat) {
					trackEvent.lat = options.lat;
					clearLocation = true;
				}

				if (!ignoreValue && !updateLocation && options.lng && options.lng !== trackEvent.lng) {
					trackEvent.lng = options.lng;
					clearLocation = true;
				}

				if (clearLocation) {
					trackEvent.location = "";
				}

				if (!ignoreValue && trackEvent.type === "STREETVIEW" && options.heading && options.heading !== trackEvent.heading) {
					trackEvent.heading = options.heading;
					map.getStreetView().setPov({
						heading: +trackEvent.heading,
						pitch: +trackEvent.pitch || 0,
						zoom: +trackEvent.zoom || 0
					});
				}

				if (!ignoreValue && trackEvent.type === "STREETVIEW" && options.pitch && options.pitch !== trackEvent.pitch) {
					trackEvent.pitch = options.pitch;
					map.getStreetView().setPov({
						heading: +trackEvent.heading || 0,
						pitch: +trackEvent.pitch,
						zoom: +trackEvent.zoom || 0
					});
				}

				if ((options.left || options.left === 0) && options.left !== trackEvent.left) {
					trackEvent.left = options.left;
					trackEvent._container.style.left = trackEvent.left + "%";
				}

				if ((options.top || options.top === 0) && options.top !== trackEvent.top) {
					trackEvent.top = options.top;
					trackEvent._container.style.top = trackEvent.top + "%";
				}

				if (options.fullscreen) {
					trackEvent.fullscreen = true;
				} else {
					trackEvent.fullscreen = false;
				}

				if ((options.height || options.height === 0) && options.height !== trackEvent.height) {
					trackEvent.height = options.height;
					trackEvent._container.style.height = trackEvent.height + "%";
					triggerResize = true;
				}

				if ((options.width || options.width === 0) && options.width !== trackEvent.width) {
					trackEvent.width = options.width;
					trackEvent._container.style.width = trackEvent.width + "%";
					triggerResize = true;
				}

				if (triggerResize) {
					google.maps.event.trigger(map, "resize");
				}

				if (options.transition && options.transition !== trackEvent.transition) {
					outerdiv.classList.remove(trackEvent.transition);
					trackEvent.transition = options.transition;
					outerdiv.classList.add(trackEvent.transition);
				}
			}	//end update
		};	//end return {
	},	//end: closes function from Popcorn.plugin("googlemap", function (options) { 
	{
		about: {
			name: "Popcorn Google Map Plugin",
			version: "0.1",
			author: "@annasob, Matthew Schranz @mjschranz",
			website: "annasob.wordpress.com, http://github.com/mjschranz",
			attribution: "Map tiles by <a target=\"_blank\" href=\"http://stamen.com\">Stamen Design</a>," + "under <a target=\"_blank\" href=\"http://creativecommons.org/licenses/by/3.0\">CC BY 3.0</a>. " + "Data by <a target=\"_blank\" href=\"http://openstreetmap.org\">OpenStreetMap</a>, " + "under <a target=\"_blank\" href=\"http://creativecommons.org/licenses/by-sa/3.0\">CC BY SA</a>."
		},
		options: {
			start: {
				elem: "input",
				type: "text",
				label: "Start",
				"units": "seconds"
			},
			end: {
				elem: "input",
				type: "text",
				label: "End",
				"units": "seconds"
			},
			type: {
				elem: "select",
				//options: ["Road Map", "Satellite", "Street View", "Hybrid", "Terrain", "Stamen - Water Color", "Stamen - Terrain", "Stamen - Toner"],
				//values: ["ROADMAP", "SATELLITE", "STREETVIEW", "HYBRID", "TERRAIN", "STAMEN-WATERCOLOR", "STAMEN-TERRAIN", "STAMEN-TONER"],
				options: ["Road Map", "Satellite", "Street View", "Hybrid", "Terrain"],
				values: ["ROADMAP", "SATELLITE", "STREETVIEW", "HYBRID", "TERRAIN"],
				label: "Map Type",
				"default": "ROADMAP",
				optional: true
			},
			location: {
				elem: "input",
				type: "text",
				label: "Location",
				"default": "Washington, DC"
			},
			fullscreen: {
				elem: "input",
				type: "checkbox",
				label: "Full-Screen",
				"default": false,
				optional: true
			},
			heading: {
				elem: "input",
				type: "number",
				label: "Heading",
				"default": 0,
				optional: true
			},
			pitch: {
				elem: "input",
				type: "number",
				label: "Pitch",
				"default": 1,
				optional: true
			},
			zoom: {
				elem: "input",
				type: "number",
				step: "1",
				label: "Zoom",
				"default": 10,
				optional: true
			},
			

			infoWindowTitle: {
				elem: "input",
				type:"text",
				label: "Pin Title",
				group:"advanced",
				"default":""	//Washington, DC
			},
			infoWindowDesc: {
				elem: "input",
				type:"text",
				label: "Pin Description",
				group:"advanced",
				"default":""	//Voice of America HQ
			},
			infoWindowOpen: {
				elem: "input",
				type: "checkbox",
				label: "Open Pin Window by Default",
				group:"advanced",
				"default": false,
				optional: true
			},
			infoWindowIsRTL: {
				elem: "input",
				type: "checkbox",
				label: "Right to Left Text",
				group:"advanced",
				"default": false,
				optional: true
			},
			spreadsheetKey: {
				elem: "input",
				type:"text",
				label: "Google Spreadsheet URL",
				group:"advanced",
				"default":""
				//,tooltip: "0AiJKIpWZPRwSdFphbEI5UjJVdTRIc2RQQ1pXT2owN3c"
			},
			transition: {
				elem: "select",
				options: ["None", "Pop", "Fade", "Slide Up", "Slide Down"],
				values: ["popcorn-none", "popcorn-pop", "popcorn-fade", "popcorn-slide-up", "popcorn-slide-down"],
				label: "Transition",
				"default": "popcorn-fade",
				group: "advanced"
			},
			top: {
				elem: "input",
				type: "number",
				label: "Top",
				units: "%",
				"default": 15,
				hidden: false,
				group: "advanced"
			},
			left: {
				elem: "input",
				type: "number",
				label: "Left",
				units: "%",
				"default": 15,
				hidden: false,
				group: "advanced"
			},
			width: {
				elem: "input",
				type: "number",
				label: "Width",
				units: "%",
				"default": 70,
				group: "advanced"
			},
			height: {
				elem: "input",
				type: "number",
				label: "height",
				units: "%",
				"default": 70,
				group: "advanced"
			},
			lat: {
				elem: "input",
				type: "number",
				label: "Lat",
				optional: true,
				hidden: true
			},
			lng: {
				elem: "input",
				type: "number",
				label: "Lng",
				optional: true,
				hidden: true
			},

			zindex: {
				hidden: true
			}
		}	//end options object
	}	//ends generic manifest object
	);	//end Popcorn.plugin("googlemap", function (options) {
}(Popcorn));	//end (function (Popcorn) { anonymous function call with Popcorn being passed