/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

define( [ "util/dragndrop", "util/lang", "editor/editor", "text!layouts/plugin-list-editor.html", "dialog/dialog" ],
  function( DragNDrop, LangUtils, Editor, EDITOR_LAYOUT, Dialog ) {

  return function( butter ) {

    var _parentElement = LangUtils.domFragment( EDITOR_LAYOUT, ".plugin-list-editor" ),
        _containerElement = _parentElement.querySelector( ".plugin-container" ),
        _addPluginElement = _parentElement.querySelector(".butter-plugin-add"),
        _targets = butter.targets,
        _optionalCount = 0, _pluginsToAdd = [],
        _iframeCovers = document.querySelectorAll( ".butter-iframe-fix" );

    var _pluginArchetype = _containerElement.querySelector( ".butter-plugin-tile" );
    _pluginArchetype.parentNode.removeChild( _pluginArchetype );

    Editor.register( "plugin-list", null, function( rootElement, butter ) {
      rootElement = _parentElement;

      Editor.BaseEditor.extend( this, butter, rootElement, {
        open: function() {
        },
        close: function() {
        }
      });
    }, true );
    
    _addPluginElement.addEventListener("click",function(e) {   	
        var dialog = Dialog.spawn( "plugin-add", {
            data: _pluginsToAdd,
            events: {
              cancel: function() {
                dialog.close();
              },
              addoptionalplugins: function(e) {
            	  var i, num = e.data.length, current, currentElement, recentlyShown={};
            	  for (i=0; i<num; i++) {
            		  current = e.data[i];
            		  // find the list item and show it
            		  currentElement = _containerElement.querySelector('.butter-plugin-tile[data-popcorn-plugin-type="' + current.type + '"]');
            		  currentElement.style.display = "";
            		  
            		  // remove from the array of optional elements
            		  recentlyShown[current.type] = true;
            	  }
            	  num = _pluginsToAdd.length-1;
            	  for (i=num; i>=0; i--) {
            		  if (recentlyShown[_pluginsToAdd[i].type]) {
            			  _pluginsToAdd.splice(i,1);
            		  }
            	  }
            	  _optionalCount = _pluginsToAdd.length;
            	  showAddMore();
            	  dialog.close();            	  
              }
            }
          });
          dialog.open();
    });

    butter.listen( "pluginadded", function( e ) {
      var element = _pluginArchetype.cloneNode( true ),
          iconImg = e.data.helper,
          icon = element.querySelector( ".butter-plugin-icon" ),
          text = element.querySelector( ".butter-plugin-label" ),
          pluginName = e.data.name;

      DragNDrop.helper( element, {
        start: function() {
          for ( var i = 0, l = _targets.length; i < l; ++i ) {
            _targets[ i ].view.blink();
            _iframeCovers[ i ].style.display = "block";
          }
        },
        stop: function() {
          butter.currentMedia.pause();
          for ( var i = 0, l = _targets.length; i < l; ++i ) {
            _iframeCovers[ i ].style.display = "none";
          }
        }
      });

      function onClick() {
        var trackEvent;

        if ( butter.currentMedia.ready ) {
          trackEvent = butter.generateSafeTrackEvent( e.data.type, {
            start: butter.currentTime
          });
          butter.editor.editTrackEvent( trackEvent );
        }
      }

      element.addEventListener( "click", onClick, false );

      if ( iconImg ) {
        icon.style.backgroundImage = "url('" + iconImg.src + "')";
      }

      text.innerHTML = pluginName;

      element.setAttribute( "data-popcorn-plugin-type", e.data.type );
      element.setAttribute( "data-butter-draggable-type", "plugin" );

      if ( e.data.hidden ) {
        element.style.display = "none";
      }
      if (e.data.optional) {
    	  element.style.display = "none";
    	  _pluginsToAdd.push(e.data);
    	  _optionalCount++;
      }
      showAddMore(); // update the add more link

      _containerElement.appendChild( element );
    });
    
    function showAddMore() {
    	if (_optionalCount > 0) {
    		_addPluginElement.style.display = "";
    	} else {
    		_addPluginElement.style.display = "none";
    	}
    }

  };
});
