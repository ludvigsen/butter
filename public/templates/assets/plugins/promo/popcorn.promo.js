// PLUGIN: promo
(function ( Popcorn ) {
	function newlineToBreak( string ) {
		// Deal with both \r\n and \n
		return string.replace( /\r?\n/gm, "<br>" );
	}  
	
	Popcorn.plugin( "promo", {
		manifest: {
			about:{
				name: "Popcorn promo Plugin",
				version: "0.1",
				author: "bbginnovate",
				website: "http://www.innovation-series.com/"
			},
			options:{
				start: {
					elem: "input",
					type: "text",
					label: "Start"
				},
				end: {
					elem: "input",
					type: "text",
					label: "End"
				},
				label: {
					elem: "input",
					type:"textarea",
//					editor: "ckeditor",
					label: "Label",
					"default": "Related Links"
				},
				headline1: {
					elem: "input",
					type: "textarea",
					label: "Headline",
					"default": "KettleCorn: Create and remix interactive video for journalists"
				},
				imageURL1: {
					elem: "input",
					type: "textarea",
					label: "Image URL",
					"default": "../assets/images/promo_default_left.jpg"
				},
				linkURL1: {
					elem: "input",
					type: "textarea",
					label: "Link URL",
					"default": "http://www.innovation-series.com/2013/10/24/introducing-kettlecorn-forking-popcorn-maker-for-journalists/"
				},
				headline2: {
					elem: "input",
					type: "textarea",
					label: "Headline",
					"default": "Download the VOA news app for news in over 40 languages"
				},
				imageURL2: {
					elem: "input",
					type: "textarea",
					label: "Image URL",
					"default": "../assets/images/promo_default_middle_voa.jpg"
				},
				linkURL2: {
					elem: "input",
					type: "textarea",
					label: "Link URL",
					"default": "https://itunes.apple.com/us/app/voa/id632618796?mt=8"
				},
				headline3: {
					elem: "input",
					type: "textarea" ,
					label: "Headline",
					"default": "RFA investigates access to clean drinking water in Asia"
				},
				imageURL3: {
					elem: "input",
					type: "textarea",
					label: "Image URL",
					"default": "../assets/images/promo_default_right_rfa.jpg"
				},
				linkURL3: {
					elem: "input",
					type: "textarea",
					label: "Link URL",
					"default": "http://www.rfa.org/english/news/special/thewaterproject/home.html"
				},
				pauseOnStart: {
					elem: "input",
					type: "checkbox",
					label: "Pause when plugin starts",
					group:"advanced",
					"default": true,
					optional: true
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
			} //end options
		}, //end manifest

		_setup: function( options ) {
			
			var DEFAULT_FONT_COLOR = "#000000",
			DEFAULT_SHADOW_COLOR = "#444444",
			DEFAULT_BACKGROUND_COLOR = "#888888";
			
			
			/*
			function getPromoStr(promos) {
				//promos is an array of <= 3
				var str="";
				for (i=1; i<promos.length;i++) {
					var p = promos[i];
					str += "<div c";
					
				}
			}
			*/
			  
			var target = Popcorn.dom.find( options.target );
			if ( !target ) {
				target = this.media.parentNode;
			}
			options._target = target;
			var label=newlineToBreak(options.label);
			
			var rssURL=options.rssURL;
			
			if (rssURL != null && rssUrl != "") {
				/*
				Popcorn.getJSONP(
					apiURL,
					function( data ) {
					  storifyAsJson=data;
					  numStories=data.content.elements.length;
					  storifyResultString=JSON.stringify(data); 
					}
				 );
				 */
			}
			
			var context = this;
			
			//CREATE OUR CONTAINER AND STYLE IT
			var promoBackground = document.createElement( "div" );
			promoBackground.setAttribute("id", "promoBackground");
			promoBackground.classList.add( "off" );
			options.promoBackground=promoBackground
			target.appendChild( promoBackground ); 
			options._container=promoBackground; 	//we have to add that line so that editor gets access
			options.toString = function() {
			   //this is the value that shows up in the track editor text
				var str="Promo-label";
				if (options.label != null) {
					str=options.label;
				}
				return str;
			};
		
		},	//end 'setup' fx
      
		start: function(event, options){
			// options.container.innerHTML="HELLO WORLD";
			var redrawBug;
			if ( options.promoBackground ) {
				console.log("PAUSE IT");
				
				if (options.pauseOnStart) {
					this.pause();	
				}
				
				options.promoBackground.classList.add( "on" );
				options.promoBackground.classList.remove( "off" );
				
				var linkURL="www.voanews.com";
				if (options.linkURL != null && options.linkURL !="") {
					linkURL=options.linkURL;
				}
				var linkTitle=linkURL;
								
				var htmlStr="";
				var titleStr="theTitle"
				var descStr="theDesc";
								
				var promoLabel=newlineToBreak(options.label);
				
				var headline1=newlineToBreak(options.headline1);
				var imageURL1=newlineToBreak(options.imageURL1);
				var linkURL1=newlineToBreak(options.linkURL1);
				
				var headline2=newlineToBreak(options.headline2);
				var imageURL2=newlineToBreak(options.imageURL2);
				var linkURL2=newlineToBreak(options.linkURL2);
				
				var headline3=newlineToBreak(options.headline3);
				var imageURL3=newlineToBreak(options.imageURL3);
				var linkURL3=newlineToBreak(options.linkURL3);

				var directionClass="LTR";
				if (options.isRTL) {
					directionClass="RTL"
				}
				
				htmlStr+="<table  id='promoTable' width='100%' cellpadding='10'>";
				htmlStr+="<tr>";
				htmlStr+="<td></td>";
				htmlStr+="<td colspan='3' class='promoLabel " + directionClass + "'>" + promoLabel + "</td>";
				htmlStr+="<td></td>";
				htmlStr+="</tr>";
				htmlStr+="<tr>";
				htmlStr+="<td></td>";
				htmlStr+="<td><a target='_blank' class='promoLink' href='"+linkURL1 + "'><img src='"+imageURL1+"' width='100%'></a></td>";
				htmlStr+="<td><a target='_blank' class='promoLink' href='"+linkURL2 + "'><img src='"+imageURL2+"' width='100%' ></a></td>";
				htmlStr+="<td><a target='_blank' class='promoLink' href='"+linkURL3 + "'><img src='"+imageURL3+"' width='100%'></a></td>";
				htmlStr+="<td></td>";
				htmlStr+="</tr>";
				htmlStr+="<tr>";
				htmlStr+="<td width='6.5%'></td>";
				htmlStr+="<td width='29%' class=' " + directionClass + "'><a target='_blank' class='promoLink' href='"+linkURL1 + "'>"+headline1+"</a></td>";
				htmlStr+="<td width='29%' class=' " + directionClass + "'><a target='_blank' class='promoLink' href='"+linkURL2 + "'>"+headline2+"</a></td>";
				htmlStr+="<td width='29%' class=' " + directionClass + "'><a target='_blank' class='promoLink' href='"+linkURL3 + "'>"+headline3+"</a></td>";
				htmlStr+="<td width='6.5%'></td>";
				htmlStr+="</tr>";
				htmlStr+="</table>";
				/*
				htmlStr+="<table>";
				htmlStr+="<tr><td><img src='../assets/images/logo_alhurra.png'></td><td>headline<BR>link</td></tr>";
				htmlStr+="<tr><td>&nbsp;</td></tr>";
				htmlStr+="<tr><td><img src='../assets/images/logo_alhurra.png'></td><td>headline<BR>link</td></tr>";
				htmlStr+="<tr><td>&nbsp;</td></tr>";
				htmlStr+="<tr><td><img src='../assets/images/logo_alhurra.png'></td><td>headline<BR>link</td></tr>";
				htmlStr+="</table>";
				*/
				
				options.promoBackground.innerHTML=htmlStr;
				
			}
		},	//end 'start' fx
		end: function( event, options ) {
			if ( options.promoBackground ) {
				options.promoBackground.classList.remove( "on" );
				options.promoBackground.classList.add( "off" );
			}
		}//end 'end' fx
  });	//end 'promo' line and 'popcorn.plugin'
}( window.Popcorn ));	//(function ( Popcorn ) {