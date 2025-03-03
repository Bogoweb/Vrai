// admin.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const api = require('../../apis/api');

// Types TypeScript
interface Participation {
  id: number;
  date: string;
  nom: string;
  firstname: string;
  email: string;
  code: string;
  etat: boolean;
  imageFacture: {
    data: string;
  };
  imageFactureType: string;
  partenaireId: number;
  updatedAt: string;
};

interface ParticipationWithPartenaire extends Participation {
  partenaireNom: string;
  partenaireType: string;
};

interface AdminProps {
  filename: string;
};

const Admin: React.FC<AdminProps> = ({ filename }) => {
  const [participations, setParticipations] = useState<ParticipationWithPartenaire[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [participationsWithPartenaire, setParticipationsWithPartenaire] = useState<ParticipationWithPartenaire[]>([]);
  const [hasFetchedPartenaires, setHasFetchedPartenaires] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getAllParticipations();
        console.log('Data fetched successfully:', response);
        setParticipations(response);
      } catch (error) {
        console.error('Error fetching participations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Fetch des nom et type de partenaire pour chaque participation, avec un check pour ne pas faire de call api en boucle
    if (participations.length > 0 && !hasFetchedPartenaires) {
      const fetchPartenaires = async () => {
        try {
          const updatedParticipations = await Promise.all(
            participations.map(async (participation) => {
              if (participation.partenaireId) {
                try {
                  const partenaire = await api.getPartenaireOfParticipation(participation.partenaireId);
                  return {
                    ...participation,
                    partenaireNom: partenaire.nom,
                    partenaireType: partenaire.type,
                  };
                } catch (error) {
                  console.error(`Erreur lors de la récupération du partenaire avec ID: ${participation.partenaireId}`, error);
                  return { ...participation, partenaireNom: 'Erreur', partenaireType: 'Erreur' };
                }
              } else {
                return { ...participation, partenaireNom: 'N/A',partenaireType: 'N/A' };
              }
            })
          );

          setParticipationsWithPartenaire(updatedParticipations);
          setHasFetchedPartenaires(true);
        } catch (error) {
          console.error('Erreur lors de la récupération des partenaires', error);
        }
      };
    fetchPartenaires();
    };
    
  }, [participations, hasFetchedPartenaires]);

  // header, extractFields et exportData pour exporter les données dans un fichier excel
  const headers = [
    { label: 'Date', key: 'date' },
    { label: 'Nom', key: 'nom' },
    { label: 'Prenom', key: 'firstname' },
    { label: 'Email', key: 'email' },
    { label: 'Code', key: 'code' },
    { label: 'Etat', key: 'etat' },
    { label: 'PartenaireId', key: 'partenaireId' },
    { label: 'Nom du partenaire', key: 'partenaireNom' },
    { label: 'Type du partenaire', key: 'partenaireType' },
  ];

  const extractFields = (participation: ParticipationWithPartenaire) => ({
    date: new Date(participation.date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    nom: participation.nom,
    firstname: participation.firstname,
    email: participation.email,
    code: participation.code,
    etat: participation.etat ,
    partenaireId: participation.partenaireId,
    partenaireNom: participation.partenaireNom,
    partenaireType: participation.partenaireType,
  });

  const exportData = participationsWithPartenaire.map(extractFields);

  const handleExportXLSX = () => {
    // Créer une feuille vide
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // Ajouter les en-têtes à la première ligne
    XLSX.utils.sheet_add_aoa(worksheet, [headers.map((header) => header.label)], { origin: 'A1' });

    // Ajouter les données
    XLSX.utils.sheet_add_json(worksheet, exportData, { origin: 'A2', skipHeader: true });

    // Créer un nouveau classeur et y ajouter la feuille
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participations');

    // Ajuster la largeur des colonnes
    const columnWidths = headers.map(() => ({ wch: 20 }));
    worksheet['!cols'] = columnWidths;

    // Générer un fichier binaire
    const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Enregistrer le fichier
    saveAs(
      new Blob([workbookBinary], { type: 'application/octet-stream' }),
      'Disney_Participations.xlsx'
    );
  };

  // Filtre de recherche
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParticipations = participationsWithPartenaire.filter((participation) => {
    const search = searchTerm.toLowerCase();
  
    return (
      participation.nom.toLowerCase().includes(search) ||
      participation.firstname.toLowerCase().includes(search) ||
      participation.partenaireId.toString().includes(search)
    );
  });

  const GoToBoPartenaire = () => {
      navigate('/BoPartenaire');
  };

  const validate = async (participationId: number) => {
    try {
      // Update de l'état
      await api.updateEtatToTrueById(participationId);
      // Refresh du tableau
      const response = await api.getAllParticipations();
      if (response.length > 0) {
        try {
          const updatedParticipations = await Promise.all(
            response.map(async (participation:any) => {
              if (participation.partenaireId) {
                try {
                  const partenaire = await api.getPartenaireOfParticipation(participation.partenaireId);
                  return {
                    ...participation,
                    partenaireNom: partenaire.nom,
                    partenaireType: partenaire.type,
                  };
                } catch (error) {
                  console.error(`Erreur lors de la récupération du partenaire avec ID: ${participation.partenaireId}`, error);
                  return { ...participation, partenaireNom: 'Erreur', partenaireType: 'Erreur' };
                }
              } else {
                return { ...participation, partenaireNom: 'N/A',partenaireType: 'N/A' };
              }
            })
          );

          setParticipationsWithPartenaire(updatedParticipations);
        } catch (error) {
          console.error('Erreur lors de la récupération des partenaires', error);
        }
      };
      console.log(`User with ID ${participationId} refused successfully`);
    } catch (error) {
      console.error('Error refusing user:', error);
    }
  };

  const refuser = async (participationId: number) => {
    try {
      // Upadate de l'état
      await api.updateEtatToFalseById(participationId);
      // Refresh du tableau
      const response = await api.getAllParticipations();
      if (response.length > 0) {
        try {
          const updatedParticipations = await Promise.all(
            response.map(async (participation:any) => {
              if (participation.partenaireId) {
                try {
                  const partenaire = await api.getPartenaireOfParticipation(participation.partenaireId);
                  return {
                    ...participation,
                    partenaireNom: partenaire.nom,
                    partenaireType: partenaire.type,
                  };
                } catch (error) {
                  console.error(`Erreur lors de la récupération du partenaire avec ID: ${participation.partenaireId}`, error);
                  return { ...participation, partenaireNom: 'Erreur', partenaireType: 'Erreur' };
                }
              } else {
                return { ...participation, partenaireNom: 'N/A',partenaireType: 'N/A' };
              }
            })
          );

          setParticipationsWithPartenaire(updatedParticipations);
        } catch (error) {
          console.error('Erreur lors de la récupération des partenaires', error);
        }
      };
      console.log(`User with ID ${participationId} refused successfully`);
    } catch (error) {
      console.error('Error refusing user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Chargement...</p>
      </div>
    );
  };

  const DownloadingFile = (e: Participation) => {
    const mimeType = e.imageFactureType;

    if (mimeType === "application/pdf") {
      return `https://api.activites-noel.fr/public/images/${e.imageFacture}`;
    } 
    else {
      return `https://api.activites-noel.fr/public/images/${e.imageFacture}`;
    }
  };

  const hrefType = (e: Participation) => {
    const mimeType = e.imageFactureType;

    if (mimeType === "application/pdf") {
      return `https://api.activites-noel.fr/public/images/${e.imageFacture}`;
    } 
    if (mimeType === "image/png" || mimeType === "image/jpeg" ) {
      return `https://api.activites-noel.fr/public/images/${e.imageFacture}`;
    }
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="w-screen h-screen bg-gray-100">
        {/* Header */}
        <header className="fixed top-0 right-0 w-screen h-24 bg-blue-600 shadow flex items-center justify-center z-10">
          <div className="h-24 flex items-center justify-center">
            <img 
                      src="/accueil/Logo.jpg"
                      alt="Disney logo"
                      className="w-24 md:w-32 mb-4 md:mb-0"
                  />
          </div>
          <div className="w-11/12 flex items-center justify-between">
            {/* User */}
            <div className="flex-1 flex justify-end items-center">
              <div className="relative w-12 h-12 text-right">
                <img src="/admin/homme.png" alt="Image utilisateur" className="w-full h-full rounded-full" />
                <h6 className="text-center text-sm mt-1">Paul</h6>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="pt-24">
          {/* Cards */}
          <div className="flex flex-wrap justify-between mb-6">
            <div className="w-60 h-40 bg-white m-5 flex justify-between p-4 shadow-lg rounded">
              <div>
                <h1 className="text-4xl">{participations.length}</h1>
                <h3 className="text-lg">Participations</h3>
              </div>
            </div>

            {/* Ajoutez d'autres cartes ici si nécessaire */}
          </div>
          <button className="m-5 bg-blue-800 text-white p-1 squared-full hover:bg-blue-950 w-36" onClick={GoToBoPartenaire}>
            Partenaires
          </button>
          {/* Recent Participations */}
          <div className="bg-white p-6 shadow-lg rounded">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl">Les participations</h2>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 mb-4"
              />
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-white hover:text-blue-700 border border-blue-800 transition"
                onClick={handleExportXLSX}
              >
                Exporter tout
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-center">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">ID</th>
                    <th className="py-2 px-4 border-b">Date</th>
                    <th className="py-2 px-4 border-b">Nom</th>
                    <th className="py-2 px-4 border-b">Prénom</th>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Id partenaire</th>
                    <th className="py-2 px-4 border-b">Nom partenaire</th>
                    <th className="py-2 px-4 border-b">Type partenaire</th>
                    <th className="py-2 px-4 border-b">Facture</th>
                    <th className="py-2 px-4 border-b">Code</th>
                    <th className="py-2 px-4 border-b">Date de moderation</th>
                    <th className="py-2 px-4 border-b">État</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipations.map((participation) => (
                    <tr key={participation.id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b">{participation.id}</td>
                      <td className="py-2 px-4 border-b">
                        {new Date(participation.date).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2 px-4 border-b">{participation.nom}</td>
                      <td className="py-2 px-4 border-b">{participation.firstname}</td>
                      <td className="py-2 px-4 border-b">{participation.email}</td>
                      <td className="py-2 px-4 border-b">{participation.partenaireId}</td>
                      <td className="py-2 px-4 border-b">{participation.partenaireNom}</td>
                      <td className="py-2 px-4 border-b">{participation.partenaireType}</td>
                      <td className="py-2 px-4 border-b">
                        <a
                          href={hrefType(participation)}
                          download={DownloadingFile(participation)}
                          target="_blank" rel="noopener noreferrer"
                          className="text-blue-700 hover:underline"
                        >
                          {participation.imageFactureType === "application/pdf" ? "Télécharger le PDF" : "Télécharger l'image"}
                        </a>
                      </td>
                      <td className="py-2 px-4 border-b">{participation.code}</td>
                      <td className="py-2 px-4 border-b">
                      {new Date(participation.updatedAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td
                        className={`py-2 px-4 border-b ${
                          participation.etat === true ? 'text-green-600' : (participation.etat === false ? 'text-red-800' : 'text-orange-600')
                        }`}
                      >
                        {participation.etat === true ? 'Validée' : (participation.etat === false ? 'Refusée' : 'En attente')}
                      </td>
                      <td className="flex py-2 px-4 border-b space-x-2 justify-center">
                        <button
                          onClick={() => validate(participation.id)}
                          className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-500 transition"
                        >
                          Valider
                        </button>
                        <button
                          onClick={() => refuser(participation.id)}
                          className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-500 transition"
                        >
                          Refuser
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
