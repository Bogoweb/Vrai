import React from 'react';


const Merci: React.FC = () => {
    return (
        <div className='bg-[#081A49] text-white font-font-Arial'>
            <div>
                <img 
                    src="/accueil/bogocdiscount.png"
                    alt="logo cdiscount et bogo"
                    className="mx-auto p-3"
                />
            </div>
            <div>
                <img 
                    src="/accueil/banniere.png"
                    alt="banniere"
                />
            </div>
            <div className='text-center font-medium text-xl text-white p-3 mt-5' >
                <p> Merci pour votre participation.</p>
                <p>Après modération, sous 96 heures ouvrées, si votre participation est conforme,</p>
                <p>vous recevrez un mail avec les informations pour bénéficier de votre activité.</p>
                <p>À bientôt !</p>
                <p>Les équipes Disney et Cdiscount</p>
            </div>
            <div className='flex mt-5'>
                <img className='mx-auto mt-3 size-[45%] md:size-[9%]' src='./accueil/bogo.png' alt='logo bogo'/>
            </div>
            <div className='flex'>
                <p className='text-center mx-auto text-xs'>©Disney. ©Disney/Pixar.<br/>© & ™ Lucasfilm Ltd. © 2024 MARVEL</p>
            </div>
            <div className="text-white p-6 text-sm font-bold flex flex-col md:flex-row justify-center md:justify-between md:mx-96">
                <a href="MODALITES - DISNEY x CDISCOUNT.pdf" className="hover:underline mx-auto" target="_blank" rel="noopener noreferrer">Modalités</a>
                <a href="MENTIONS LEGALES - DISNEY x CDISCOUNT.pdf" className="hover:underline mx-auto" target="_blank" rel="noopener noreferrer">Mentions légales</a>
                <a href="mailto:contact@activites-noel.fr" className="hover:underline mx-auto" target="_blank" rel="noopener noreferrer">Contact</a>
            </div>
        </div> 
    );

};

export default Merci;
