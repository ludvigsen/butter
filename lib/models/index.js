/**
 * Define all models in a single place to make sure that sequelize is initialized only once.
 */

"use strict";

function defaultDBReadyFunction( err ) {
  if ( err ) {
    err = Array.isArray( err ) ? err[ 0 ] : err;
    console.warn( "lib/project.js: DB setup error\n", err.number ? err.number : err.code, err.message );
  }
}

module.exports = function( config, dbReadyFn ) {
  config = config || {};

  dbReadyFn = dbReadyFn || defaultDBReadyFunction;

  var username = config.username || "",
      password = config.password || "",
      Sequelize = require( "sequelize" ),
      sequelize;

  try {
    sequelize = new Sequelize( config.database, username, password, config.options );
  } catch (e) {
    dbReadyFn(e);
    return {
      isDBOnline: function isDBOnline() {
        return false;
      }
    };
  }

  var dbOnline = false;
  
  //load models
  var modelsToLoad = [
    "project",
    "account"
  ];
  var models = {};
  modelsToLoad.forEach(function(model) {
	  models[model] = sequelize.import(__dirname + '/' + model);
  });  

  sequelize.sync().complete(function( err ) {
    if ( !err ) {
      dbOnline = true;
    }

    dbReadyFn( err );
  });

  return {
	  getSequelizeInstance: function(){
	      return sequelize;
	  },
	  models: models,
	  isDBOnline: function isDBOnline() {
		  return dbOnline;
	  },
  };
};