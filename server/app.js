const express = require('express');
const partenaire = require('./src/routes/partenaire');
const participation=require('./src/routes/participation');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 7001;
app.use(express.json());
app.use(cors());

app.use('/public', express.static(__dirname + '/public')); // Dossier accessible depuis la partie admin en front
app.use('/api', participation,partenaire); // Mount the router under the /api path

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

