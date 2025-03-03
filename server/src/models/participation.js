const sequelize = require('../db/cnx');
const Partenaire = require('./partenaire');
const { DataTypes } = require('sequelize');

const Participation = sequelize.define('Participation', {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true, 
    },
  },
  partenaireId: {
    type: DataTypes.INTEGER,
    references: {
      model: Partenaire, // Le modèle cible
      key: 'id',         // La clé dans le modèle cible (par défaut 'id' dans Sequelize)
    },
    allowNull: false,
  },
  imageFacture: {
    type: DataTypes.STRING, 
    allowNull: false, 
  },
  imageFactureType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code:{
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  etat: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue:null,
  },
});

Participation.belongsTo(Partenaire, { foreignKey: 'partenaireId' }); // Association entre Participation et Partenaire

module.exports = Participation;