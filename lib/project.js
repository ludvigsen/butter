"use strict";
/**
 * Takes the project model and runs database queries and functions against it
 */
module.exports = function( Project ) {
  var butterVersion = require( "../package.json" ).version;

  function forceRange( lower, upper, n ) {
    // Deal with n being undefined
    n = n|0;
    return n < lower ? lower : Math.min( n, upper );
  }

  // TODO: should strip out the null fields I'm not passing to attributes in results
  function getProjectsByDate( whichDate, limit, callback ) {
    Project.findAll({
      limit: forceRange( 1, 100, limit ),
      // createdAt or updatedAt
      order: whichDate + ' DESC'
    }).complete( callback );
  }
  
  function getPublicProjectsByDate( whichDate, limit, callback ) {
	    Project.findAll({
	      limit: forceRange( 1, 100, limit ),
	      where: ["sharePublic = ? OR sharePublic=?", 'true',1],
        //where: { sharePublic: 'true' },
        // createdAt or updatedAt
	      order: whichDate + ' DESC'
	    }).complete( callback );
	  }

  function getProjectsWhere( where, callback ) {
    Project.findAll( { where: where } ).complete( callback );
  }

  return {

    create: function( options, callback ) {
      options = options || {};
      var email = options.email,
          data = options.data;

      if ( !email || !data ) {
        callback( "Expected email and data on options object" );
        return;
      }

      var project = Project.build({
        data: JSON.stringify( data.data ),
        email: email,
        name: data.name,
        author: data.author || "",
        description: data.description,
        template: data.template,
        originalButterVersion: butterVersion,
        latestButterVersion: butterVersion,
        remixedFrom: data.remixedFrom,
        thumbnail: data.thumbnail,
        sharePublic: data.sharePublic
      });

      project.save().complete( callback );
    },

    delete: function( options, callback ) {
      options = options || {};
      var email = options.email,
          pid = options.id;

      if ( !email || !pid ) {
        callback( "not enough parameters to delete" );
        return;
      }

      Project.find( { where: { email: email, id: pid } } )
      .success(function( project ) {

        if ( project ) {

          project.destroy()
          .success(function() {
            callback( null, project );
          })
          .error(function( err ) {
            callback( err );
          });
        } else {
          callback( "the project has already been deleted" );
        }
      })
      .error(function( error ) {
        callback( error );
      });
    },

    findAll: function( options, callback ) {
      options = options || {};
      var email = options.email;

      if ( !email ) {
        callback( "Missing email parameter" );
        return;
      }

      getProjectsWhere( { email: email }, callback );
    },

    find: function( options, callback ) {
      options = options || {};
      if ( !options.id ) {
        callback( "Missing Project ID" );
        return;
      }

      // We always have a project id, but only sometimes an email.
      var where = options.email ? { id: options.id, email: options.email } :
                                  { id: options.id };

      getProjectsWhere( where, function( err, results ) {
        callback( err, results[0] );
      });
    },

    findRecentlyCreated: function( options, callback ) {
      options = options || {};
      if (options.published) {
    	  getPublicProjectsByDate('createdAt',options.limit,callback);
      } else {
    	  getProjectsByDate( 'createdAt', options.limit, callback );
      }
    },

    findRecentlyUpdated: function( options, callback ) {
      options = options || {};
      if (options.published) {
    	  getPublicProjectsByDate( 'updatedAt', options.limit, callback );
      } else {
    	  getProjectsByDate('updatedAt',options.limit,callback)
      }
    },

    findRecentlyRemixed: function( options, callback ) {
      options = options || {};
      Project.findAll({
        where: 'NOT remixedFrom IS NULL',
        limit: forceRange( 1, 100, options.limit ),
        order: 'createdAt DESC'
      }).complete( callback );
    },

    findRemixes: function( options, callback ) {
      options = options || {};
      getProjectsWhere( { remixedFrom: options.id }, callback );
    },

    update: function updateProject( options, callback ) {
      options = options || {};
      var email = options.email,
          pid = options.id,
          data = options.data;

      if ( !email || !pid || !data ) {
        callback( "Expected email, id, and data parameters to update" );
        return;
      }

      Project.find( { where: { email: email, id: pid } } )
      .success(function( project ) {
        if ( !project ) {
          callback( "project not found" );
          return;
        }

        var projectDataJSON = data.data;
        var projectDataString = JSON.stringify( projectDataJSON );

        project.updateAttributes({
          data: projectDataString,
          email: email,
          name: data.name,
          author: data.author || "",
          description: data.description,
          template: data.template,
          latestButterVersion: butterVersion,
          remixedFrom: data.remixedFrom,
          thumbnail: data.thumbnail,
          sharePublic: data.sharePublic
        })
        .error( function( err ) {
          callback( err );
        })
        .success( function( projectUpdateResult ) {
          callback( null, projectUpdateResult );
        });
      })
      .error(function( error ) {
        callback( error );
      });
    }
  };
};
