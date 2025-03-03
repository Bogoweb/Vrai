import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const api = require('../../apis/api');

// Types TypeScript
interface Partenaire {
  id: number;
  nom: string;
  type: string;
  adresse: string;
  cp: number;
  ville: string;
  telephone: string;
  mail: string;
  region: string;
  site: string;
  description: string;
};

interface Props {
  filename: string;
};

const BoPartenaire: React.FC<Props> = ({ filename }) => {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editedPartenaire, setEditedPartenaire] = useState<Partenaire | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getAllPartenaires();
        console.log('Data fetched successfully:', response);
        setPartenaires(response);
      } catch (error) {
        console.error('Error fetching participations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const headers = [
    { label: 'id', key: 'id' },
    { label: 'nom', key: 'nom' },
    { label: 'type', key: 'type' },
    { label: 'adresse', key: 'adresse' },
    { label: 'cp', key: 'cp' },
    { label: 'ville', key: 'ville' },
    { label: 'telephone', key: 'telephone' },
    { label: 'mail', key: 'mail' },
    { label: 'region', key: 'region' },
    { label: 'site', key: 'site' },
    { label: 'description', key: 'description' },
  ];

  const extractFields = (partenaire: Partenaire) => ({
    id: partenaire.id,
    nom: partenaire.nom,
    type: partenaire.type,
    adresse: partenaire.adresse,
    cp: partenaire.cp,
    ville: partenaire.ville,
    telephone: partenaire.telephone,
    mail: partenaire.mail,
    region: partenaire.region,
    site: partenaire.site,
    description: partenaire.description,
  });

  const exportData = partenaires.map(extractFields);

  const [searchTerm, setSearchTerm] = useState('');

  // Filtre des partenaires pour la recherche
  const filteredPartenaires = partenaires.filter((partenaire) => {
    const search = searchTerm.toLowerCase();
  
    return (
      // Filtre selon le nom et la région
      partenaire.nom.toLowerCase().includes(search) ||
      partenaire.region.toLowerCase().includes(search) ||
      partenaire.id.toString().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Chargement...</p>
      </div>
    );
  };

  // Fonction pour déposer un fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files![0];

    // Check si il y a un fichier et si il est du type .xlsx
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        setFile(file);
    else {
        alert('Déposez un fichier XLSX (excel)');
        setFile(null);
    }
  };

  // Fonction pour importer un fichier
  const importfile = async () => {
    if (!file){
      alert("Veuillez deposer un fichier a importer");
      return;
    }
    try {

      const response = await api.ImportPartenaire(file);

      // Message qui comprend le cas où les partenaires sont déja présents
      alert(response.message);

      // Refresh du tableau des partenaires
      setPartenaires(await api.getAllPartenaires());

    } catch (error) {
      console.log('Error during partenaire import:', error);
      alert("Une erreur est survenue lors de l'importation des partenaires.");
    }
  };

  // Fonction pour créer un fichier xlsx contenant les partenaires
  const handleExportXLSX = () => {
    // Créer une feuille vide
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // Ajouter les en-têtes à la première ligne
    XLSX.utils.sheet_add_aoa(worksheet, [headers.map((header) => header.label)], { origin: 'A1' });

    // Ajouter les données
    XLSX.utils.sheet_add_json(worksheet, exportData, { origin: 'A2', skipHeader: true });

    // Créer un nouveau classeur et y ajouter la feuille
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Partenaires');

    // Ajuster la largeur des colonnes
    const columnWidths = headers.map(() => ({ wch: 20 }));
    worksheet['!cols'] = columnWidths;

    // Générer un fichier binaire
    const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Enregistrer le fichier
    saveAs(
      new Blob([workbookBinary], { type: 'application/octet-stream' }),
      'Disney_Partenaires.xlsx'
    );
  };

  // Fonction pour supprimer un partenaire (on ne peut pas supprimer un partenaire qui est utilisé dans une participation)
  const checkAndDeletePartenaire = async (partenaireId:number) => {
    // On regarde si il y a des participations qui utilisent le partenaire que l'on veut supprimer
    const participation = await api.getParticipationByPartenaire(partenaireId)
    if (participation.length > 0){
      alert('Des participations sont liées à ce partenaire.')
      return;
    }

    // Si il n'y en a pas on le supprime et on alert
    await api.deletePartenaire(partenaireId);
    alert('Partenaire n°' + partenaireId + ' supprimé.');

    // Refresh de la table des partenaires
    setPartenaires((prevPartenaires) =>
      prevPartenaires.filter((partenaire) => partenaire.id !== partenaireId)
    );
  };

  const handleEditClick = (partenaire: Partenaire) => {
    setEditId(partenaire.id); // Stock l'id du partenaire qui se fait editer + active ledition
    setEditedPartenaire(partenaire); // Stock le partenaire qui se fait editer
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editedPartenaire) {
      const { name, value } = e.target;
      setEditedPartenaire({ ...editedPartenaire, [name]: value });
    }
  };

  const handleSaveClick = async () => {
    if (editedPartenaire) {
      try {
        const formData = new FormData(); // Transformation du nouveau partenaire en Formdata pour pouvoir l'envoyer a l'api

        formData.append('nom', editedPartenaire.nom);
        formData.append('mail', editedPartenaire.mail);
        formData.append('telephone', editedPartenaire.telephone);
        formData.append('description', editedPartenaire.description);
        await api.editPartenaire(editedPartenaire.id, formData); // Update le partenaires avec les nouvelles donnees

        const response = await api.getAllPartenaires();   // Reupdate les partenaires pour pas avoir a refresh
        console.log('Data fetched successfully:', response);
        setPartenaires(response);

        setEditId(null); // Desactive le mode edition
        setEditedPartenaire(null); // Réinitialise le partenaires editer

      } catch (error) {
        console.error('Error updating partenaire:', error);
      }
    }
  };
  
  const GoToBoAdmin = () => {
    navigate('/Admin');
  };

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="w-screen h-screen bg-gray-100">
        {/* Header */}
        <header className="fixed top-0 right-0 w-screen h-24 bg-blue-600 shadow flex items-center justify-center z-10">
          <div className="h-24 flex items-center justify-center">
            <img src="/accueil/Logo.jpg" alt="Disney logo" className="w-24 md:w-32 mb-4 md:mb-0"/>
          </div>
          <div className="w-11/12 flex items-center justify-between">
            {/* User */}
            <div className="flex-1 flex justify-end items-center">
              <div className="relative w-12 h-12 text-right">
                <img src="/admin/homme.png" alt="utilisateur" className="w-full h-full rounded-full" />
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
                <h1 className="text-4xl">{partenaires.length}</h1>
                <h3 className="text-lg">Partenaires</h3>
              </div>
            </div>
            <div>
                <label htmlFor="file-upload" className="cursor-pointer bg-white text-[#081A49] m-5 px-5 h-16 w-80 flex text-left items-center hover:bg-blue-900 truncate">
                  {file ? file.name : "Déposer un fichier à importer (.xlsx)"}
                </label>
                <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <button 
                    className="cursor-pointer bg-white text-[#081A49] m-5 px-5 h-16 w-80 flex justify-center items-center hover:bg-blue-900"
                    onClick={importfile}
                >Importer le fichier deposé
                </button>
            </div>
            {/* Ajoutez d'autres cartes ici si nécessaire */}
          </div>
          <button className="m-5 bg-blue-800 text-white p-1 squared-full hover:bg-blue-950 w-36" onClick={GoToBoAdmin}>
            Admin
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
                    <th className="py-2 px-4 border-b">Nom</th>
                    <th className="py-2 px-4 border-b">Region</th>
                    <th className="py-2 px-4 border-b">Type</th>
                    <th className="py-2 px-4 border-b">Mail</th>
                    <th className="py-2 px-4 border-b">Telephone</th>
                    <th className="py-2 px-4 border-b">Description</th>
                    <th className="py-2 px-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartenaires.map((partenaire) => (
                      <tr className="hover:bg-gray-100">
                        {editId === partenaire.id ? (
                          <>
                            {/* Formulaire pour editer le partenaire*/}
                            <td className="py-2 px-4 border-b">{partenaire.id}</td>
                            <td className="py-2 px-4 border-b">
                              <input
                                type="text"
                                name="nom"
                                value={editedPartenaire?.nom}
                                onChange={handleInputChange}
                                className="border p-1"
                              />
                            </td>
                            <td className="py-2 px-4 border-b">
                              <input
                                type="text"
                                name="region"
                                value={editedPartenaire?.region}
                                onChange={handleInputChange}
                                className="border p-1"
                              />
                            </td>
                            <td className="py-2 px-4 border-b">
                              <input
                                type="text"
                                name="type"
                                value={editedPartenaire?.type}
                                onChange={handleInputChange}
                                className="border p-1"
                              />
                            </td>
                            <td className="py-2 px-4 border-b">
                              <input
                                type="email"
                                name="mail"
                                value={editedPartenaire?.mail}
                                onChange={handleInputChange}
                                className="border p-1"
                              />
                            </td>
                            <td className="py-2 px-4 border-b">
                              <input
                                type="text"
                                name="telephone"
                                value={editedPartenaire?.telephone}
                                onChange={handleInputChange}
                                className="border p-1"
                              />
                            </td>
                            <td className="py-2 px-4 border-b">
                              <textarea
                                name="description"
                                value={editedPartenaire?.description}
                                onChange={handleInputChange}
                                className="border p-1"
                              />
                            </td>
                            <td className="flex py-2 px-4 border-b space-x-2 justify-center">
                              <button
                                onClick={handleSaveClick}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-400 transition"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditId(null)}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-400 transition"
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            {/* Affichage normal */}
                            <td className="py-2 px-4 border-b">{partenaire.id}</td>
                            <td className="py-2 px-4 border-b">{partenaire.nom}</td>
                            <td className="py-2 px-4 border-b">{partenaire.region}</td>
                            <td className="py-2 px-4 border-b">{partenaire.type}</td>
                            <td className="py-2 px-4 border-b">{partenaire.mail}</td>
                            <td className="py-2 px-4 border-b">{partenaire.telephone}</td>
                            <td className="py-2 px-4 border-b truncate max-w-[300px]">{partenaire.description}</td>
                            <td className="flex py-2 px-4 border-b space-x-2 justify-center">
                              <button
                                onClick={() => checkAndDeletePartenaire(partenaire.id)}
                                className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-500 transition"
                              >
                                Supprimer
                              </button>
                              <button
                                onClick={() => handleEditClick(partenaire)}
                                className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-500 transition"
                              >
                                Edit
                              </button>
                            </td>
                          </>
                        )}
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

export default BoPartenaire;
