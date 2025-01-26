window.onload = function () {
  loadInteresovanja();
};

function loadInteresovanja() {
  PoziviAjax.getMojaInteresovanja((error, data) => {
    if (error) {
      if (error.status === 401) {
        alert("Niste prijavljeni. Molimo prijavite se.");
        window.location.href = "/prijava.html";
        return;
      }
      alert("Došlo je do greške prilikom učitavanja interesovanja.");
      return;
    }

    const container = document.getElementById("upiti-container");

    const interesovanja = Array.isArray(data) ? data : JSON.parse(data);

    if (interesovanja.length === 0) {
      container.innerHTML += "<p>Nemate nijednog interesovanja.</p>";
      return;
    }

    const interesovanjaSection = document.createElement("div");
    interesovanjaSection.innerHTML = "<h1>Moja Interesovanja</h1>";

    interesovanja.forEach((interesovanje) => {
      const interesovanjeElement = createInteresovanjeElement(interesovanje);
      interesovanjaSection.appendChild(interesovanjeElement);
    });

    container.appendChild(interesovanjaSection);
  });
}

function createInteresovanjeElement(interesovanje) {
  const div = document.createElement("div");
  div.className = "upit-card";

  const headerElement = document.createElement("h3");
  headerElement.textContent = `Nekretnina ID: ${interesovanje.id_nekretnine}`;
  div.appendChild(headerElement);

  // Common for all types of interesovanja
  const tekstElement = document.createElement("p");
  tekstElement.innerHTML = `<strong>Tekst:</strong> ${interesovanje.tekst}`;
  div.appendChild(tekstElement);

  // Specific handling based on type
  switch (interesovanje.type) {
    case "ponuda":
      const ponudaStatusElement = document.createElement("p");
      ponudaStatusElement.innerHTML = `<strong>Status:</strong> ${
        interesovanje.odbijenaPonuda ? "odbijena" : "odobrena"
      }`;
      div.appendChild(ponudaStatusElement);
      break;

    case "zahtjev":
      // Date formatting
      const formattedDate = new Date(
        interesovanje.trazeniDatum
      ).toLocaleDateString();

      const zahtjevDateElement = document.createElement("p");
      zahtjevDateElement.innerHTML = `<strong>Datum:</strong> ${formattedDate}`;
      div.appendChild(zahtjevDateElement);

      const zahtjevStatusElement = document.createElement("p");
      zahtjevStatusElement.innerHTML = `<strong>Status:</strong> ${
        interesovanje.odobren ? "odobren" : "na čekanju"
      }`;
      div.appendChild(zahtjevStatusElement);
      break;
  }

  const detailsLink = document.createElement("a");
  detailsLink.href = `detalji.html?id=${interesovanje.id_nekretnine}`;
  detailsLink.textContent = "Pogledaj detalje nekretnine";
  div.appendChild(detailsLink);

  return div;
}
