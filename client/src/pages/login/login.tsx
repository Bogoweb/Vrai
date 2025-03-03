import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface BackofficeLoginProps {
  onLogin: () => void;
}

const BackofficeLogin: React.FC<BackofficeLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === 'mbressy@bogoplus.fr' && password === 'Bogo2015+') {
      onLogin();
      navigate('/admin');
    } else {
      alert('Identifiant ou mot de passe invalide');
    }
  };

  return (
    <div className='flex flex-col bg-blue-900 w-screen h-screen text-center'>
        <label className="flex justify-center mb-4 text-3xl md:text-5xl">
            Page de Connexion Disney
        </label>
      <label>
        Nom d'utilisateur:
      </label>
      <div className='flex justify-center' >
        <input
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            className="flex m-5 bg-white mb-4 p-2 border squared-full w-50"
            />
      </div>
      <label>
        Mot de passe:
      </label>
      <div className='flex justify-center' >
        <input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="flex m-5 bg-white mb-4 p-2 border squared-full w-50"
            />
        </div>
      <div className='flex justify-center text-center' >
        <button className="m-5 bg-blue-500 text-white p-1 squared-full hover:bg-blue-950 w-36"  onClick={handleLogin}>Connexion</button>
      </div>
    </div>
  );
};

export default BackofficeLogin;
