/**
 * Provides singleton access to the undo manager.
 */
define(['UndoManager'],function(UndoManagerQueue){
    var instance = null,
    undoManager;
 
    function UndoManagerWrapper(){
        if(instance !== null){
            throw new Error("Cannot instantiate more than one UndoManagerWrapper, use UndoManagerWrapper.getInstance()");
        } 
        
        this.initialize();
    }

    UndoManagerWrapper.prototype = {
        initialize: function(){
            undoManager = new UndoManagerQueue();   
        },
        // wrap the UndoManager functions that will be utilized by Butter
    	register: function (undoObj, undoFunc, undoParamsList, undoMsg, redoObj, redoFunc, redoParamsList, redoMsg) {
    		undoManager.register(undoObj, undoFunc, undoParamsList, undoMsg, redoObj, redoFunc, redoParamsList, redoMsg);
    	},    	
    	undo: function() {
   			undoManager.undo();
    	},    	
    	redo: function() {
   			undoManager.redo();
    	}
    };
    
    UndoManagerWrapper.getInstance = function(){
        // summary:
        //      Gets an instance of the singleton. It is better to use 
        if(instance === null){
            instance = new UndoManagerWrapper();
        }
        return instance;
    };
 
    return UndoManagerWrapper.getInstance();
});