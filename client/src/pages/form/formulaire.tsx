import "./formulaire.css";

const Form = () => {
  return (
    <div className="absolute inset-0 z-0 h-[200%] bg-cover bg-center"
      style={{
        backgroundImage: "url('accueil/fond_form.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "top center"
      }}>
      <div className="relative z-10 font-font-Arial">
        <div className='flex-grow flex flex-col justify-start items-center pt-[500px]'>
          <div className="min-h-[1235px] w-[60%] bg-cover flex flex-col justify-start items-center border border-red-700" style={{
            backgroundImage: "url('accueil/fond_formulaire.png')"
          }}>
            <h3 className="text-7xl text-white text-center -mt-[0.5em]">Confirmer mon activité</h3>

            <div className="w-[80%] min-h-[1030px] mt-[50px] p-8 flex flex-col justify-start items-center border border-amber-300">
              <p className="text-5xl pb-8 text-green-700">Formulaire</p>

              <div className="flex flex-col w-full px-4 border border-green-300">
                <h5 className="text-3xl pb-4">Mes informations</h5>

                <form>
                  <div className="flex justify-start gap-x-24 w-[70%] text-[20px]">
                    <fieldset className="flex gap-x-2 justify-center items-center">
                      <input type="radio" className="radio" id="madame" name="genre" value="Madame" />
                      <label htmlFor="madame">Madame</label>
                    </fieldset>

                    <fieldset className="flex gap-x-2 justify-center items-center">
                      <input type="radio" className="radio" id="monsieur" name="genre" value="Monsieur" />
                      <label htmlFor="monsieur">Monsieur</label>
                    </fieldset>
                  </div>

                  <div className="flex flex-col gap-y-3 text-[20px] py-3">
                    <input type="text" className="input" placeholder="Nom*" required />
                    <input type="text" className="input" placeholder="Prénom*" required />
                    <input type="email" className="input" placeholder="E-mail*" required />
                    <input type="tel" className="input" placeholder="Téléphone mobile*" required />
                    <input type="text" className="input" placeholder="Adresse postale*" required />
                    <input type="text" className="input" placeholder="Adresse postale du partenaire*" required />
                    <input type="text" className="input" placeholder="Code postal du partenaire*" required />
                    <input type="text" className="input" placeholder="Ville du partenaire*" required />
                  </div>

                  <p className="text-[10px] py-6">
                    Votre adresse e-mail et votre numéro de téléphone doivent être valides.<br />
                    Vous serez contactés par e-mail pour recevoir votre pass, ou par téléphone en cas de gain ou autre besoin.
                  </p>

                  {/*<input type="file" className="pt-5 pb-4" required />*/}

                  <label className="file">
                    <input type="file" id="file" aria-label="File browser example" />
                      <span className="file-custom">Téléchargez votre Ticket de caisse*</span>
                  </label>

                  <p className="text-[10px] pb-6">
                    Formats acceptés: JPG, PNG, GIF, PDF. Poids maximum de l'image: 10 Mo.<br />
                    Toute image illisible ne sera pas prise en compte.
                  </p>

                  <div className="flex flex-col gap-y-4">
                    <div>
                      <input type="checkbox" className="float-left mx-1" required />
                      <p className="text-[10px]">J'accepte le présent <a href="#" className="">règlement du jeu</a>
                        et pour les besoins du jeu, j'autorise la Société Organisatrice à collecter mes informations personelles,
                        mon adresse complète et mes justificatifs d'achat. Ces données pourront être communiquées aux prestataires
                        de service et sous-traitants pour l'exécution de travaux effectués pour son compte dans le cadre du présent jeu.
                        Ces données seront conservées pendant toute la durée de l'opération.
                      </p>
                    </div>

                    <div>
                      <input type="checkbox" className="float-left mx-1" />
                      <p className="text-[10px]">
                        Je consens à ce que les données recueillies puissent être transmises et exploitées par la Société Organisatrice à des fins commerciales,
                        de prospection, de communication ou de promotion et puissent être communiquées aux prestataires de service et sous-traitants
                        pour l'exécution de travaux effectués pour son compte.
                        L'ensemble des données personnelles collectées dans le cadre de ce présent jeu sont conservées pendant une durée maximale
                        indiquée dans les mentions légales de la Société Organisatrice à compter de la validation de la participation.
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex justify-center items-center">
                    <button type="submit" className="w-[210px] rounded-full text-white bg-green-700 py-1 my-4">
                      JE VALIDE <br /> MA PARTICIPATION
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Form;