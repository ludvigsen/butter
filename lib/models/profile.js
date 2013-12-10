"use strict";

module.exports = function (sequelize, DataTypes) {
	return sequelize.define("Profile", {
		 id: {
	      type: DataTypes.INTEGER,
	      primaryKey: true,
	      autoIncrement: true
	    },
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true
			}
		},
		language_id: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				isAlphanumeric: true,
				len: [0, 3]
			}
		},
		organization_id: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				isAlphanumeric: true
			}
		},
		translationType: {
	      type: DataTypes.STRING
	    },
	    twitterHandle: {
	      type: DataTypes.STRING
	    },
	    displayName: {
	      type: DataTypes.STRING
	    },
	}, {
		paranoid: true, // saves rows rather then deleting since this is account history information
		comment: "Defines additional user profile data outside of Persona authentication information",
	})
};