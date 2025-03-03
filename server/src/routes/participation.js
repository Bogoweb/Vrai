const express = require('express');
const Participation = require('../models/participation');
const Partenaire = require('../models/partenaire')
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const router = express.Router();
const pdf = require('html-pdf');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const absolutePath = path.resolve(__dirname, '../../public/images');
    cb(null, absolutePath);
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, (err, hash) => {
      if (err) return cb(err);
      const fileName = `${hash.toString('hex')}${path.extname(file.originalname)}`;
      cb(null, fileName);
    });
  },
});

const transporter = nodemailer.createTransport({
  host:"ssl0.ovh.net",
  port: 465,
  secure: true,
  auth: {
    user: "contact@activites-noel.fr",
    pass: "Bogo2015@"
  },
});

const upload = multer({ storage });

router.post('/add-participation', upload.any(), async (req, res) => {
  try {
    const { nom, firstname, email, partenaireId, imageFactureType} = req.body;
    console.log(req.files[0]);
    const imageFacture = req.files[0].filename;
    console.log(imageFacture);


    const participation = await Participation.create({
      date: new Date(),
      nom,
      firstname,
      email,
      partenaireId,
      imageFacture,
      imageFactureType,
    });

    res.status(201).json({ message: 'ok' });
  } catch (error) {
    console.error('Error during participation creation:', error);
    res.status(500).json({ error: 'Error during participation creation' });
  }
});



router.get('/get-all-participations', async (req, res) => {
  try {
    const participations = await Participation.findAll();
    res.status(200).json(participations);
  } catch (error) {
    console.error('Error fetching participations:', error);
    res.status(500).json({ error: 'Error fetching participations', details: error.message });
  }
});

router.get('/get-participation-by-partenaire/:partenaireId', async (req, res) => {
  const partenaireId = req.params.partenaireId;

  try {
    const participationByPartenaire = await Participation.findAll({
      where: {
        partenaireId: partenaireId,
      },
    });

    res.status(200).json(participationByPartenaire);
  } catch (error) {
    console.error('Error getting participation by partenaire:', error);
    res.status(500).json({ error: 'Error getting participation by partenaire.' });
  }
});

function generateRandomCode(length) {
  const characters = 'abcdefghijkmnopqrstwxyzACDEFGHJKLMNPQRSTWXYZ2345679';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
}

async function generatePDF(participation, partenaire, code) {
  try {
    const htmlContent = `
<html>
    <head>
        <style>
        body {
            font-family: Arial, sans-serif;
            width: screen;
        }
        footer{
          margin-left: 20px;
          margin-right: 20px;
        }
        .logo {
            text-align: center;
        }
        .logo img {
            width: 100%;
            margin-bottom: 10px;
        }
        .cot-1 {
            display:flex;
            flex-direction:row;
            width:60%;
            font-size:12px;
            margin-left: 25vw;
        }

        .pass{
            font-size:10px;
            flex: 1;
            width: auto;
            display: inline-block;
            background-color: #ECECEA;
            width: 40vw;
            padding-left: 15px;
        }
        .user {
            font-size:10px;
            flex: 1;
            width: auto;
            display: inline-block;
            background-color: #ECECEA;
            margin-left: 50px;
            width: 40vw;
            padding-left: 15px;
        }

        .cot-2{
            font-size:10px;
            text-align: center;
        }
        .cot-3{
            position:relative;
            margin-top:15px;
            margin-bottom: 15px;
            padding:5px;
            left:30vw;
            font-size:9px;
            margin-left:10px;
            padding-left:20px;
            background-color:#ECECEA;
            width:50%;
            

        }
        .cot-4{
            left:5px;
            text-align:center;
            font-size:9px;

        }
        .cot-5{
            text-align: justify;
            padding-left: 20px;
            padding-right: 20px;
            font-size:6px;
        }
        .cot-5 .rouge{
            color:red;

        }
        
        </style>
    </head>
    <body>
        <div class="logo">
            <img src="https://www.activites-noel.fr/accueil/banniere.png" alt="Activite-noel">
        </div>
        <span class="cot-1">
            <span class="pass">
                <p>Pass n° : ${code}<p>
                <p>Valable jusqu'au: 30 juin 2025</p>
            </span>
            <span class="user">
                <p>${participation.firstname}</p>
                <p>${participation.nom}</p>
            </span>
        </span>
        <span class="cot-2">
            <p>Félicitations ${participation.firstname} !</p>
            <p>Vous avez participé à l’opération DISNEY x CDISCOUNT et vous avez choisi une activité de loisir.<br>
            Pour profiter d’une entrée parent-enfant dans l’établissement sélectionné, suivez les informations <br>
            du partenaire ci-dessous.</p>
            <p><b>Ce pass est valable 1 fois jusqu’au 30 juin 2025, sauf fermeture annuelle ou exceptionnelle.</b></p> 
        </span>
        <div class="cot-3">
            <h4>Coordonnées du partenaire :</h4>
            <p>${partenaire.nom}</p>
            <p>${partenaire.type}</p>
            <p>${partenaire.cp} - ${partenaire.ville}</p>
            <p>${partenaire.mail}</p>
            <p>${partenaire.telephone}</p>
            <p>${partenaire.site}</p>
            <p>${partenaire.description}</p>
        </div>
        <span class="cot-4"> 
            <p><b>Ce pass est nominatif et unique, en aucun cas il ne pourra être réémis (perte, vol…).<br>
            Il est valable uniquement pour la personne dont le nom et le prénom figurent en haut de ce pass<br>
            et pour l’établissement dont les coordonnées sont indiquées</b></p>
        </span>
    </body>
    <footer>
      <span class="cot-5">
        <p>Offre réservée aux particuliers, non cumulable avec d’autres offres promotionnelles ou tarif privilégié (y compris tarif Comité d’Entreprise)
        en cours dans les établissements partenaires. Un pass maximum par famille ou groupe de visiteurs lors du passage en caisse chez le partenaire.
        Vous avez jusqu’au 30 juin 2025 pour vous rendre chez le partenaire dont les coordonnées figurent ci-dessus ; sauf fermeture annuelle ou exceptionnelle de l’établissement.
        Tout pass illisible, incomplet ou photocopié sera considéré comme nul.
        Ce pass ne peut être obtenu ou distribué en dehors du site <span style="color: black;">activites-noel.fr</span>. Pour  obtenir des conseils ou connaitre les conditions particulières de certains
        établissements contactez la société organisatrice de l’opération par mail à <span style="color: black;">contact@activites-noel.fr</span>.
        Une réponse vous sera apportée sous 96 heures ouvrées. Les données personnelles collectées dans ce pass d’échange ne
        seront conservées que pour une durée strictement nécessaire aux finalités pour lesquelles elles sont collectées, à savoir pour une période maximum de
        trois (3) semaines après la fin de validité du pass et seront ensuite détruites. La participation est réservée aux clients CDISCOUNT, ayant reçu un pass et
        participé dans les dates de l’offre. Le pass ne peut être remboursé et aucun pass d’échange ne sera remplacé s’il est perdu, supprimé, volé ou endommagé.
        La société organisatrice ne saurait être tenue pour responsable en cas d’un éventuel accident survenu lors de l’utilisation du pass.<br><br>
        Conformément au Règlement général sur la protection des données n°2016/679 et à la loi dite « Informatique et libertés » du 6 janvier 1978 dans sa
        dernière version, chaque participant dispose d’un droit d’accès, de rectification, d’effacement des données à caractère personnel qui le concernent, d’un
        droit à la limitation du traitement, d’un droit d’opposition pour motifs légitimes, d’un droit à la portabilité des données et du droit de définir des directives
        relatives à la conservation, à l'effacement et à la communication des données à caractère personnel après son décès. Le Participant peut exercer ces droits
        par e-mail à l’adresse suivante: <span style="color: black;">dpo@savencia.com ou sur simple demande écrite à CF&R, Service qualité, BP 80085, 14503 Vire Cedex, France.</span>
        Un justificatif d’identité pourra lui être demandé. L’exercice d’un de ces droits peut être refusé au Participant si sa demande ne remplit pas les conditions
        posées par la réglementation. Dans cette hypothèse, le Participant en sera dûment informé.
        <br>
        En cas de réclamation, le Participant dispose du droit de saisir la CNIL à l’adresse suivante :<span style="color: black;"> 7-19 quai du président Paul Doumer CS60151–92672 Courbevoie Cedex–France</span></p>
      </span>
    </footer>
</html>
    `;
    const pdfOptions = {
      format: 'Letter',
      zoomFactor: 0.75,
      base: './assets',
      childProcessOptions: {
        env: {
          OPENSSL_CONF: '/dev/null',
        },
      }
    };
    const pdfBuffer = await new Promise((resolve, reject) => {
      pdf.create(htmlContent,pdfOptions).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });
    const fileName = `${participation.firstname}_${participation.nom}_${participation.id}.pdf`;
    const filePath = path.join(__dirname, '../../public/', fileName);

    // Écrire le fichier PDF sur le disque
    fs.writeFileSync(filePath, pdfBuffer);

    return filePath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}


async function sendmailwithpdf(partenaire,participation, pdfFileName) {
  try {
    const mailParticipationOption = {
      from: "contact@activites-noel.fr",
      to: participation.email,
      subject: 'Votre participation au jeu CDiscount',
      html:`
  <html>
  <head>
    <style>
    .centrer {
      text-align: center;
      margin: 0 auto;
    }
      a.button {
        display: inline-block;
        padding: 10px;
        width:200px;
        background-color: #162A7B;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        height:30px;
      }
      .info{
        color: #9FA0A7;
        font-size:12px;
      }

    </style>
  </head>
  <body>
    <p>Bonjour ${participation.firstname},</p>

    <p>Félicitations !</p>
    <p>Vous avez participé à l’opération CDISCOUNT/DISNEY et vous avez gagné une activité. Pour en bénéficier, veuillez télécharger le pass ci-dessous et suivre les informations. Celui-ci est valable jusqu’au 30 juin 2025 chez le partenaire suivant :</p>
    <div class="centrer">
      <p>Contact du prestataire :<br>
        Nom : ${partenaire.nom}<br>
        Catégorie : ${partenaire.type}<br>
        Adresse : ${partenaire.adresse || ''}<br>
        Code postal : ${partenaire.cp}<br>
        Ville : ${partenaire.ville}<br>
        Site internet : <a href="${partenaire.site}">${partenaire.site || ''}</a><br>
        Mail : ${partenaire.mail || ''}<br>
        Telephone : ${partenaire.telephone || ''}<br>
        Détails : ${partenaire.description}<br>
      </p>
      <a href="${pdfFileName}" class="button">TÉLÉCHARGER MON PASS</a>
    </div>
    <p>Amusez-vous bien !</p>
    <p class="info">Les sociétés organisatrices ne sauraient être tenues pour responsable en cas d’un éventuel accident survenu lors de l’utilisation du pass. Conformément au Règlement Général sur la Protection des Données à caractère personnel, les Participants ont un droit d’accès, de rectification, de suppression ou d’opposition pour motifs légitimes. Les Participants pourront exercer leurs droits par email à contact@activites-noel.fr</p>
  </body>
  </html>
      `,
    }
    
    await transporter.sendMail(mailParticipationOption);
  } catch (error) {
    console.error('Error when sending mail:', error);
    res.status(500).json({ error: 'Error during mail sending with pdf', details: error.message });
  }
}

router.put('/validate-participation/:id', async (req, res) => {
  try {
    const participationId = req.params.id;
    const participation = await Participation.findByPk(participationId);
    code = generateRandomCode(5);
    if (participation.code){
      code = participation.code;
    }

    const Updatedparticipation = await Participation.update({ etat: true, code: code }, {
      where: {
        id: participationId
      }
    });

    if (Updatedparticipation[0] === 0) {
      return res.status(404).json({ error: 'Participation not found' });
    }

    const partenaire = await Partenaire.findByPk(participation.partenaireId);
    if (!partenaire) {
      return res.status(404).json({ error: 'Partenaire not found erreur ici'+ participation.partenaireId });
    }

    const pdfFileName = `https://api.activites-noel.fr/${participation.firstname}_${participation.nom}_${participation.id}.pdf`;

    await generatePDF(participation, partenaire, code)

    await sendmailwithpdf(partenaire,participation, pdfFileName)

    res.status(200).json({ message: 'Participation validated successfully' });
  } catch (error) {
    console.error('Error during participation validation:', error);
    res.status(500).json({ error: 'Error during participation validation', details: error.message });
  }
});

router.put('/refuse-participation/:id', async (req, res) => {
  try {
    const participationId = req.params.id;
    
    const updatedParticipation = await Participation.update({ etat: false }, {
      where: {
        id: participationId
      }
    });

    if (updatedParticipation[0] === 0) {
      return res.status(404).json({ error: 'Participation not found' });
    }

    res.status(200).json({ message: 'Participation refused successfully' });
  } catch (error) {
    console.error('Error during participation refusal:', error);
    res.status(500).json({ error: 'Error during participation refusal', details: error.message });
  }
});

module.exports = router;