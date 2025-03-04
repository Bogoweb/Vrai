import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Accueil from './pages/accueil/accueil'
import Form from './pages/form/formulaire';
import Merci from './pages/merci/merci';
import Admin from './pages/admin/admin';
import BackofficeLogin from './pages/login/login';
import BoPartenaire from './pages/admin/bopartenaire';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  function PrivateRoute({ children }: { children: JSX.Element }) {
    return loggedIn ? children : <Navigate to="/login" />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<BackofficeLogin onLogin={handleLogin} />} />
        <Route path="/" element={<div className="App bg-[#081A49] font-font-Arial"><Accueil /></div>} />
        <Route path="/form" element={<Form />} />
        <Route path="/merci" element={<Merci />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin filename={''} />
            </PrivateRoute>
          }
        />
        <Route
          path="/BoPartenaire"
          element={
            <PrivateRoute>
              <BoPartenaire filename={''} />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
