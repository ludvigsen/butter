"use strict";

module.exports = function(sequelize, DataTypes) {
  return sequelize.define( "Account", {
    email: {
      type: DataTypes.STRING,
      primaryKey: true,
      validate: {
        isEmail: true
      }
    },
    language_id: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlphanumeric: true,
        len: [0,3]
      }
    },
    organization_id: {
    	type: DataTypes.STRING,
    	allowNull: true,
    	validate: {
    		isAlphanumeric: true
    	}
    }
  }, {
	  paranoid: true, // saves rows rather then deleting since this is account history information
	  comment: "Defines additional user account data outside of Persona authentication information",
  })
};
