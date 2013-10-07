/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */
 
/*
	* audioKeyframe popcorn plug-in
	* Set audio level based on time specified by user
	* Options parameter will need a start time, end time, startVolume, endVolume (optional), and audio transition type
	* -Start is the time that you want this plug-in to execute
	* -End is the time that you want this plug-in to stop executing
	* -volumeStart is the volume the plugin should set as soon as it starts executing
	* -volumeEnd is the volume the plugin should end at IF it's a transition, else ignored
	* Example:
		var p = Popcorn("#video")
			.audioKeyframe({
			start: 5, // seconds
			end: 15, // seconds
			volumeStart: 5,
			volumeEnd: 10,
			audioTransitionType:"linear"
		});

		var p = Popcorn("#video")
			.audioKeyframe({
			start: 5, // seconds
			end: 6, // seconds	- irrelevant since this is constant
			volumeStart: 5,
			volumeEnd: 5,	//not used since this is constant
			audioTransitionType:"constantLevel"
		});
	*
*/

(function( Popcorn ) {
	Popcorn.plugin( "audioKeyframe", 
		function(options) {
			var  that = this;
			//when doing a transition, how frequently in MS should we update? 500 has proven to be a good value.
			var MS_BETWEEN_VOLUME_UPDATES=500;	
			return {
				_setup: function( options ) {
					lastRunTime=-1;
					options.toString = function() {
						var displayStr="";
						displayStr="Audio KeyFrame";
						if (options.audioTransitionType == "linearFade") {
							displayStr="Linear Fade: " + options.volumeStart + "% to " + options.volumeEnd + "%" ;
						} else if (options.audioTransitionType=="constantLevel") {
							displayStr=options.volumeStart + "% Constant";
						}
						return displayStr; 
					};
				},
				start: function() {
				},
				end: function() {
				},
				frame: function(event, options, time) {
					var	scale = 1, 
						opacity = 1,
						t = time - options.start,
						div = options.container,
						transform;
					if (!that.paused()) {
						if (lastRunTime != time ) {
							if (options.audioTransitionType == "constantLevel") {
								var intendedVolume=options.volumeStart/100
								if (that.volume() != intendedVolume) {
									that.volume(intendedVolume);
								}
							} else {
								var msSinceLastUpdate=Math.abs(lastRunTime-time)*1000;
								if (msSinceLastUpdate > MS_BETWEEN_VOLUME_UPDATES) {
									lastRunTime=time;
									if (options.audioTransitionType == "linearFade") {
										var b = options.volumeStart;
										var dy=options.volumeEnd-options.volumeStart;
										var dx=options.end-options.start;
										var x = t;
										var m=dy/dx;
										//NOTE: you must call parsefloat, or the math here will not work
										var y = parseFloat(m*x) + parseFloat(b);	
										var newVolume=y;									
										//console.log("m=" + m + " x= " + x + " b=" + b + " newVolume=" + newVolume);
										// error prevention..make sure we don't in any circumstance set a bad volume val
										newVolume=Math.max(0,newVolume);
										newVolume=Math.min(100,newVolume);
										that.volume(newVolume/100);
									}
								}
							}
						}
					}
				},

				_teardown: function( options ) {
					// this.off( "timeupdate", options.skipRange );
				}
			};
		},
		{
			about:{
				name: "Popcorn Audio Keyframe Plugin",
				version: "0.1",
				author: "bbginnovate",
				website: "http://www.innovation-series.com/",
				codeKey:"audioKeyframe"
			},
			options: {
				start: {
					elem: "input",
					type: "text",
					label: "In",
					units: "seconds"
				},
				end: {
					elem: "input",
					type: "text",
					label: "Out",
					units: "seconds"
				},
				audioTransitionType: {
					elem: "select",
					options: [ "Linear Fade", "Constant Level (Use Start Vol)"],
					values: [ "linearFade", "constantLevel"],
					label: "Audio Transition",
					default: "linearFade",
					optional: true
				},
				volumeStart: {
					elem: "input",
					type: "range",
					label: "Start Vol",
					min: 0,
					max: 100,
					default:0
				},
				volumeEnd: {
					elem: "input",
					type: "range",
					label: "End Vol",
					min: 0,
					max: 100,
					default:100
				},

				target: {
					"hidden": true
				}
			}
		}
	);
}( Popcorn ));