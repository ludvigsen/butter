"use strict";

module.exports = function (sequelize, DataTypes) {
	return sequelize.define("Profile", {
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
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				isAlphanumeric: true,
				len: [0, 20],
				defaultValue:"hand"
			}
		},
	}, {
		paranoid: true, // saves rows rather then deleting since this is account history information
		comment: "Defines additional user profile data outside of Persona authentication information",
	})
};