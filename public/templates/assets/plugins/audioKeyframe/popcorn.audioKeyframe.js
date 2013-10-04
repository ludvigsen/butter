(function( Popcorn ) {
	Popcorn.plugin( "audioKeyframe", 
		function(options) {
			var  that = this;
			var MS_BETWEEN_VOLUME_UPDATES=200;
			//declare instance vars here
			return {
				_setup: function( options ) {
					lastRunTime=-1;
					options.toString = function() {
						var displayStr="";
						displayStr="AudioKey";
						if (options.audioTransitionType == "fadeIn") {
							displayStr="Fade In";
						} else {
							displayStr="Fade Out";
						}
						return displayStr; 
					};
				},
				start: function() {
				},
				end: function() {
				},
				frame: function(event, options, time) {
					var scale = 1, 
					opacity = 1,
					t = time - options.start,
					duration=options.end-options.start,
					div = options.container,
					transform;
					if (!that.paused()) {
						if (lastRunTime != time ) {
							var msSinceLastUpdate=Math.abs(lastRunTime-time)*1000;
							if (msSinceLastUpdate > MS_BETWEEN_VOLUME_UPDATES) {
								lastRunTime=time;
								var percentageOfDuration=t/duration;
								var newVolume=percentageOfDuration;
								
								if (options.audioTransitionType == "fadeOut") {
									newVolume=1.0-newVolume;
								}

								console.log("audio keyframe plugin setting volume to " + newVolume);
								that.volume(newVolume);
							}
							//set the vlume
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
					options: [ "Fade In", "Fade Out"],
					values: [ "fadeIn", "fadeOut"],
					label: "Audio Transition",
					default:"fadeIn",
					optional: true
				},
				target: {
					"hidden": true
				}
			}
		}
	);
}( Popcorn ));