const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('disney2024', 'disney2024', 'Bogo150915', { // 1ere arg = nom de la db, 2eme arg = nom utilisateur de la db, 3eme arg = mdp de lutilisateur
  host: 'fe46787-001.eu.clouddb.ovh.net',
  port: 35385,
  dialect: 'mysql',
  dialectOptions: {
    connectTimeout: 60000, 
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('CONNEXION DB OK !');
  })
  .catch((err) => {
    console.error('CONNEXION KO !', err);
  });

module.exports = sequelize;
