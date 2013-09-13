// PLUGIN: lowerThird
(function ( Popcorn) {
	Popcorn.plugin( "lowerThird", {
		manifest: {
			about:{
				name: "Popcorn lowerThird Plugin",
				version: "0.1",
				author: "bbginnovate",
				website: "http://www.innovation-series.com/",
				codeKey:"lowerThird"
			},
			options:{
				start: {
					elem: "input",
					type: "number",
					label: "Start"
				},
				end: {
					elem: "input",
					type: "number",
					label: "End"
				},
				title: {
					elem: "input",
					type: "textarea",
					label: "Title",
					"default": "Enter a Title"
				},
				description: {
					elem: "input",
					type: "textarea",
					label: "Description",
					"default": "Enter a Description"
				},
				transition: {
		          elem: "select",
		          options: [ "None", "Pop", "Fade", "Slide Up", "Slide Down" ],
		          values: [ "popcorn-none", "popcorn-pop", "popcorn-fade", "popcorn-slide-up", "popcorn-slide-down" ],
		          label: "Transition",
		          "default": "popcorn-fade"
		        },
				
		        logo: {
		          elem: "input",
		          "default": "notYetSet_logo",
		          hidden:true
		        }, 
		      
		        includeLogo: {
					elem:"input",
					type:"checkbox",
					label:"Include Entity Logo",
					group:"advanced",
					default:true	//a default value of anything other than the empty string will make it checked
				},
				
				linkUrl: {
					elem:"input",
					type:"text",
					label:"Link URL",
					group:"advanced",
					default:"notYetSet_linkUrl"
				},
				zindex: {
		          hidden: true
		        }

			} //end options
		}, //end manifest

		_setup: function( options ) {
			function newlineToBreak( string ) {
				// Deal with both \r\n and \n
				return string.replace( /\r?\n/gm, "<br>" );
			}   
			
			var DEFAULT_FONT_COLOR = "#000000",
			DEFAULT_SHADOW_COLOR = "#444444",
			DEFAULT_BACKGROUND_COLOR = "#888888",
			transition = options.transition,
			target = Popcorn.dom.find( options.target ),  // || options._natives.manifest.options.transition[ "default" ],
			title=newlineToBreak(options.title),
			description=newlineToBreak(options.description);
			
			if (options.logo=="notYetSet_logo" && window.Butter && window.Butter.app && window.Butter.app.kettlecornfield) {
				var newLogo=window.Butter.app.kettlecornfield.organization_id();
				options.logo=newLogo;
			}
			
			if (options.linkUrl=="notYetSet_linkUrl"  && window.Butter && window.Butter.app && window.Butter.app.kettlecornfield) {
				var org=window.Butter.app.kettlecornfield.organization_id();
				var domain = window.Butter.app.kettlecornfield.organization_domain();
				var newLink="";
				if (org) {
					newLink="http://"+domain;
				} else {
					newLink="http://google.com";
				}
				options.linkUrl=newLink;
			}
			
			
			if ( !target ) {
				target = this.media.parentNode;
			}
			options._target = target;
			
			//CREATE OUR CONTAINER AND STYLE IT
			var container = options._container = document.createElement( "div" );
			container.style.zIndex = +options.zindex;
			container.setAttribute("id", "lowerThirdContainer");
			
			target.appendChild( container ); 
			  
			options._transitionContainer=container;
			options._transitionContainer.classList.add( "off" );
			options._transitionContainer.classList.add( transition );
			
			options.toString = function() {
				return ((options.title) ? options.title : "Lower Third Title");
			};
		
		},	//end 'setup' fx
      
		start: function(event, options){
			// options.container.innerHTML="HELLO WORLD";
			var transitionContainer = options._transitionContainer;
			var redrawBug;
			
			if ( transitionContainer ) {
				transitionContainer.classList.add( "on" );
				transitionContainer.classList.remove( "off" );
				
				var linkUrl=options.linkUrl;
				var linkTitle=linkUrl;
								
				var htmlStr="";
				var titleStr=options.title;
				var descStr=options.description;
				var linkStr="<a id='lowerThirdLink' href='"+linkUrl+"'>"+linkTitle+"</a>";
				
				var imgStyle="";
				var imgDivStr="";
				if (options.includeLogo) {
					if (options.logo) {
						imgStyle=" style=\"background-image:url('../assets/images/logo_"+options.logo+".png')\" ";
						imgDivStr+="<div id='lowerThirdPromoImageContainer' "  + imgStyle + "  >";
						//imgDivStr+="<img src=\"../assets/images/1_1_borderFix.png\" id=\"logoLowerThird\" " + imgStyle+">";
						imgDivStr+="</span>";
					}
					
				}
				htmlStr+="<table width='100%' height='50%'><tr  height='100%'><td width='80%'>"; 
				htmlStr+="<div id='lowerThirdGradientBG'>";
				
				htmlStr+="<div id='lowerThirdTitle'>" + titleStr  + "</div>";
				htmlStr+="<div id='lowerThirdDescription'>" + descStr + "</div><hr id='lowerThirdHR'>";
				htmlStr+=linkStr; 
				htmlStr+="</div>"; //end lowerThirdGradientBG
				htmlStr+="</td><td width='20%' height='100%'>"+imgDivStr+"</td></tr></table>";
				//htmlStr+=imgDivStr;
								
				options._container.innerHTML=htmlStr;
			}
		},	//end 'start' func
		end: function( event, options ) {
			if ( options._transitionContainer ) {
				options._transitionContainer.classList.remove( "on" );
				options._transitionContainer.classList.add( "off" );
			}
		}//end 'end' func
  });	//end  Popcorn.plugin( "lowerThird", {
}( window.Popcorn));	//(function ( Popcorn ) {