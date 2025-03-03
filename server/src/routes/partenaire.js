const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const csvParser = require('csv-parser');
const fs = require('fs');
const Partenaire = require('../models/partenaire');
const xlsx = require('xlsx');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.post('/import-excel', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const partenaires = [];

  try {
    const workbook = xlsx.readFile(filePath);

    // Sélectionner la première feuille (ou une autre si besoin)
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convertir la feuille en format JSON
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
    
    data.forEach((row) => {
      partenaires.push({
        nom: row.nom,
        type: row.type,
        adresse: row.adresse,
        cp: row.cp,
        ville: row.ville,
        telephone: row.telephone,
        mail: row.mail,
        region: row.region,
        site: row.site,
        description: row.description,
      });
    });
    if (partenaires.length === 0) {
      return res.status(400).json({ message: 'Le fichier est vide ou ne contient aucun partenaire valide.' });
    }

    //Récupérer tous les partenaires existants dans la base de données
    const existingPartenaires = await Partenaire.findAll({
      attributes: ['nom', 'type', 'adresse', 'cp', 'ville', 'telephone', 'mail', 'region', 'site', 'description'],
    });

    // Créer un Set des clés uniques des partenaires existants
    const existingSet = new Set(existingPartenaires.map(p => 
      `${p.nom.toLowerCase()}|${p.region.toLowerCase()}|${p.ville.toLowerCase()}`
    ));

    // Filtrer les partenaires qui n'existent pas encore
    const nouveauxPartenaires = partenaires.filter(p => {
      const key = `${p.nom.toLowerCase()}|${p.region.toLowerCase()}|${p.ville.toLowerCase()}`;
      return !existingSet.has(key);
    });

    if (nouveauxPartenaires.length === 0) {
      return res.status(200).json({ message: 'Aucun nouveau partenaire à importer.' });
    }

    // Insertion des nouveaux partenaires dans la base de données
    await Partenaire.bulkCreate(nouveauxPartenaires);
    //await Partenaire.bulkCreate(partenaires);


    res.status(200).json({ message: `${nouveauxPartenaires.length} partenaires importés avec succès.` });
  } catch (error) {
    console.error('Erreur lors de l\'importation des partenaires :', error);
    res.status(500).json({ message: 'Erreur lors de l\'importation des partenaires.',
    error: error.message,
    partenaires: nouveauxPartenaires
    });
  }
});


router.delete('/delete-partenaire/:id', async (req, res) => {
  const partenaireId = req.params.id;

  try {
    const partenaire = await Partenaire.findByPk(partenaireId);

    if (!partenaire) {
      return res.status(404).json({ error: 'Partenaire not found' });
    }

    await partenaire.destroy();
    res.status(200).json({ message: 'Partenaire deleted successfully' });
  } catch (error) {
    console.error('Error during partenaire deletion:', error);
    res.status(500).json({ error: 'Error during partenaire deletion' });
  }
});

router.put('/edit-partenaire/:id', upload.any(), async (req, res) => {
  const partenaireId = req.params.id;
  const {nom, mail, telephone, description}  = req.body;
  console.log(nom);
  try {
    const updatedPartenaire = await Partenaire.update({ nom: nom, mail: mail, telephone:telephone, description: description}, {
      where: {
        id: partenaireId
      }
    });
    res.status(200).json({ message: 'Partenaire updated successfully in back', updatedPartenaire });
  } catch (error) {
    console.error('Error during partenaire update:', error);
    res.status(500).json({ error: 'Error during partenaire update' });
  }
});

router.get('/get-partenaires-by-region/:region', async (req, res) => {
  const region = req.params.region;

  try {
    const partenairesByRegion = await Partenaire.findAll({
      where: {
        region: region,
      },
    });

    res.status(200).json(partenairesByRegion);
  } catch (error) {
    console.error('Error getting partenaires by region:', error);
    res.status(500).json({ error: 'Error getting partenaires by region' });
  }
});

router.get('/get-partenaire-of-participation/:partenaireId', async (req, res) => {
  const partenaireId = req.params.partenaireId;

  try {
    const partenaireOfParticipation = await Partenaire.findOne({
      where: {
        id: partenaireId,
      },
    });

    res.status(200).json(partenaireOfParticipation);
  } catch (error) {
    console.error('Error getting partenaire of participation:', error);
    res.status(500).json({ error: 'Error getting partenaire of participation' });
  }
});

router.get('/get-all-partenaires', async (req, res) => {
  try {
    const partenaires = await Partenaire.findAll();

    res.status(200).json(partenaires);
  } catch (error) {
    console.error('Error getting all partenaires:', error);
    res.status(500).json({ error: 'Error getting all partenaires' });
  }
});
module.exports = router;