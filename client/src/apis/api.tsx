import axios from 'axios';

const BASE_URL = 'https://api.activites-noel.fr/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

interface Partenaire {
  id: number;
  nom: string;
  type: string;
  site: string;
  mail: string;
  adresse: string;
  cp: number;
  ville: string;
  telephone: string;
  description: string;
};

export const addParticipation = async (participationData : any) => {
  try {
    const response = await api.post('/add-participation', participationData);
    return response.data;
  } catch (error) {
    console.error('Error adding participation:', error);
    throw error;
  }
};

export const getAllPartenaires = async () => {
  try {
    const response = await api.get('/get-all-partenaires');
    return response.data;
  } catch (error) {
    console.error('Error fetching all partenaires:', error);
    throw error;
  }
};

export const getPartenairesByRegion = async (region : any): Promise<Partenaire[]> => {
  try {
    const response = await api.get(`/get-partenaires-by-region/${region}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching partenaires by region:', error);
    throw error;
  }
};

export const getPartenaireOfParticipation = async (partenaireId : any): Promise<Partenaire[]> => {
  try {
    const response = await api.get(`/get-partenaire-of-participation/${partenaireId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching partenaire of participation:', error);
    throw error;
  }
};

export const getParticipationByPartenaire = async (partenaireId : any) => {
  try {
    const response = await api.get(`/get-participation-by-partenaire/${partenaireId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching participation by partenaire:', error);
    throw error;
  }
};

export const updateEtatToTrueById = async (participationId : any) => {
  try {
    const response = await api.put(`/validate-participation/${participationId}`);
    return response.data;
  } catch (error) {
    console.error('Error updating etat to true by ID:', error);
    throw error;
  }
};

export const updateEtatToFalseById = async (participationId : any) => {
  try {
    const response = await api.put(`/refuse-participation/${participationId}`);
    return response.data;
  } catch (error) {
    console.error('Error updating etat to false by ID:', error);
    throw error;
  }
};

export const getAllParticipations = async () => {
  try {
    const response = await api.get('/get-all-participations');
    return response.data;
  } catch (error) {
    console.error('Error fetching all participations:', error);
    throw error;
  }
};

export const deletePartenaire = async (partenaireId : any) => {
  try {
    const response = await api.delete(`/delete-partenaire/${partenaireId}`)
    return response.data;
  } catch (error) {
    console.log('Error deleting partenaire:', error);
    throw error;
  }
};

export const editPartenaire = async (partenaireId : any, formData : any) => {
  try {
    console.log(formData.get('nom'))
    const response = await api.put(`/edit-partenaire/${partenaireId}`, formData)
    return response.data;
  } catch (error) {
    console.log('Error updating partenaire:', error);
    throw error;
  }
};

export const ImportPartenaire = async (file : any) => {
  const formData = new FormData();
  formData.append('file', file); //'file' doit match le 'file' (ils doivent avoir le meme mot en gros) du upload.single de lendpoint en backend

  try {
    const response = await api.post(`/import-excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.log('Error during partenaire import:', error);
    throw error;
  }
};

export default {
  getAllPartenaires,
  getPartenairesByRegion,
  getPartenaireOfParticipation,
  addParticipation,
  updateEtatToTrueById,
  updateEtatToFalseById,
  getAllParticipations,
  deletePartenaire,
  editPartenaire,
  ImportPartenaire,
  getParticipationByPartenaire,
};
