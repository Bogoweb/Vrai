const { DataTypes } = require('sequelize');
const sequelize = require('../db/cnx');

const Partenaire = sequelize.define('Partenaire', {
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adresse: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ville: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: false
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: false,
  },
  mail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  site: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'partenaires',
});


module.exports = Partenaire;
