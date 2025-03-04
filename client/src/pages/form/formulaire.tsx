import React, { useState, useEffect } from 'react';
import Select, { SingleValue } from 'react-select';
import { useNavigate } from 'react-router-dom';

const api = require('../../apis/api');

const Form = () => {
return (
  <div className="absolute inset-0 z-0 bg-cover bg-center" 
  style={{ 
    backgroundImage: "url('http://localhost:3000/accueil/fond_form.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "top center"
  }}>
   <div className="relative z-10  text-white font-font-Arial">
   
        <div className='flex-grow md:flex md:flex-row md:h-screen justify-start'>
        </div>
      </div>
  </div>
);};

export default Form;