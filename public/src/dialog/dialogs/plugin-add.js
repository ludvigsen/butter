/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

define([ "text!dialog/dialogs/plugin-add.html", "dialog/dialog" ],
  function( LAYOUT_SRC, Dialog ){

  Dialog.register( "plugin-add", LAYOUT_SRC, function( dialog, plugins ) {
	var pluginArchetype = dialog.rootElement.querySelector( ".butter-plugin-tile" ),
	i, num, plugin,
	containerElement = dialog.rootElement.querySelector(".plugin-container"),
	addButton = dialog.rootElement.querySelector(".butter-add-profile-btn"),
	pluginsToAdd = [];
	
	pluginArchetype.parentNode.removeChild( pluginArchetype );
	num = plugins.length;
	for (i=0; i<num; i++) {
		plugin = plugins[i];
		var element = pluginArchetype.cloneNode( true ),
        icon = element.querySelector( ".butter-plugin-icon" ),
        text = element.querySelector( ".butter-plugin-label" );
		
		element.setAttribute('data-butter-index',i);
		element.setAttribute('data-butter-plugin-type',plugin.type)
		
		if (plugin.helper) {
			icon.style.backgroundImage = "url('" + plugin.helper.src + "')";
		}
		text.innerHTML = plugin.name;
		
		element.addEventListener("click",function(e) {
			// check to see if selecting or de-selecting and then update CSS and pluginsToAdd array accordingly
			if (this.classList.contains("selected")) {
				// de-select
				var k, knum = pluginsToAdd.length;
				for (k=0; k<knum; k++) {
					if (pluginsToAdd[k].type == this.getAttribute('data-butter-plugin-type')) {
						pluginsToAdd.splice(k,1);
						k = knum-1; // break inner loop
					}
				}
				if (pluginsToAdd.length == 0) {
					addButton.classList.add('butter-disabled');
				}
			} else {
				// add to list
				pluginsToAdd.push(plugins[this.getAttribute('data-butter-index')]);	
				addButton.classList.remove('butter-disabled');
			}
			this.classList.toggle("selected");
		});
		
		containerElement.appendChild(element);
	}
	
	addButton.addEventListener("click",function(e) {
		if (pluginsToAdd.length > 0) {
			dialog.send("addoptionalplugins",pluginsToAdd);
		}
	});
	  
    dialog.enableCloseButton();
    dialog.assignEscapeKey( "default-close" );
    dialog.assignEnterKey( "default-ok" );
  });
});