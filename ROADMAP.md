#Roadmap of future features
We have a robust backlog of features, plugins and fixes we'd like to build into KettleCorn. Here are some of the priorities.

###NEW FEATURES AND PLUGINS
~~**Choose your own adventure plugin:**~~ Enable the viewer to click on a link/image in the project to navigate to a different point in the project. This has potential uses for non-linear storytelling in journalism (as well as non-journalism stories). SOLUTION: We added a field in the 'Advanced' tab to specify a time to jump to for the image- and text-based plugins. 

**Transcripts/subtitles plugin:** Enable the creator to import a 'transcript' with timecodes that automatically styles and positions the text as a subtitle. We're primarily thinking about importing a google spreadsheet with timecodes. Secondarily, we'd like to support importing an actual transcript text file. Users should be able to set the subtitles positioning (top/bottom) and style (white on black or black text on white) from the plugin menu. 

**Audio keyframes plugin:** Enable creators to change volume for individual media sources over time. The suggested/requested use case here is to enable creators to quickly dub/sub translation audio.

**Drawing plugin:** Enable creators to add and style simple canvas-based (or SVG) shapes and drawings to a project. Draw an oval/circle, rectangle/square, lines and freeform shape; and set the line weight, line color and fill.

**Data viz plugin:** Enable creators to import data and select the output (pie, bar, line etc). Potentially the ability to synchronize the graphic with the video (highlights/selection)?

**Support audio-based projects on iOS:** Currently the events fire at the appropriate times but there's no audio playing.

**Incorporate analytics:** Track usage of the KettleCorn editor, projects, plugins, and the evolution of projects through remixing.

###INCORPORATING POPCORN MAKER FEATURES
**Incorporate media search:** The current version of Popcorn Maker now includes the ability to search for media content (youtube, soundcloud etc) from the editor. 

**Incorporate archive.org footage:** The current version of Popcorn Maker allows creators to insert clips directly from archive.org based on transcript in/out times. This could be a fantastic resource for journalists.

###MINOR UPDATES/TWEAKS
**Display lat/lng coordinates for locations:** When a creator types in an address or location, display a read-only version of the latitude and longitude. Users are looking for a simplified way to find lat/lng coordinates for the google spreadsheet. 

**Upload a custom logo for lower thirds:** Right now we're tying the lower-thirds logo to the creators's email address. It would be nice if creators outside of BBG could attach a PNG logo to their profile for a customized lower third.

~~**Fix wikipedia support for non-english:**~~ The wikipedia plugin works great in English but doesn't seem to work in other languages (regardless of whether you enter a foreign search term or provide the actual URL). FIX: Now supports searching in different languages and RTL languages.

**Gallery search/sort:** Enable viewers to sort the gallery based on author, language, media outlet, publication date, or by searching the title and descriptions.
