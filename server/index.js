const sequelize = require('./src/db/cnx');

require("./app")
// Synchronisation du modèle avec la base de données
sequelize.sync()
  .then(() => {
    console.log('Modèles synchronisés avec la base de données');
  })
  .catch((err) => {
    console.error('Erreur lors de la synchronisation des modèles :', err);
  });
