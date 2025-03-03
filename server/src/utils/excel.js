const ExcelJS = require('exceljs');


async function importDataToPartenaires(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(1); // Utilisez la première feuille par défaut
  if (!worksheet) {
    throw new Error("La feuille Excel est introuvable.");
  }

  const data = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const [id, nom, type, adresse, cp, ville, mail, region, site, description] = row.values;

    // a adpater les trucs a recuperer selon les infos quon a/veut sur les partenaires surement se baser sur le modele qd on aura les infos
    data.push({
      id: id,
      nom: nom || null,
      type: type || null,
      adresse: adresse || null,
      cp: cp ? parseInt(cp) : null,
      ville: ville || null,
      mail: mail || null,
      region: region || null,
      site: site || null,
      description: description || null,
    });
  });

  return data;
}

module.exports = { importDataToPartenaires };
