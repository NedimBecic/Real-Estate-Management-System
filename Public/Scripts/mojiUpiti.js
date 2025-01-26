window.onload = function () {
  loadUpiti();
};

function loadUpiti() {
  PoziviAjax.getMojiUpiti((error, data) => {
    if (error) {
      if (error.status === 401) {
        alert("Niste prijavljeni. Molimo prijavite se.");
        window.location.href = "/prijava.html";
        return;
      }
      alert("Došlo je do greške prilikom učitavanja upita.");
      return;
    }

    const container = document.getElementById("upiti-container");
    container.innerHTML = ""; 

    const upiti = Array.isArray(data) ? data : JSON.parse(data);

    if (upiti.length === 0) {
      container.innerHTML = "<p>Nemate nijedan upit.</p>";
      return;
    }

    upiti.forEach((upit) => {
      const upitElement = createUpitElement(upit);
      container.appendChild(upitElement);
    });
  });
}

function createUpitElement(upit) {
  const div = document.createElement("div");
  div.className = "upit-card";

  const idNekretnine = document.createElement("h3");
  idNekretnine.textContent = `Nekretnina ID: ${upit.id_nekretnine}`;

  const tekst = document.createElement("p");
  tekst.textContent = upit.tekst_upita;

  const detailsLink = document.createElement("a");
  detailsLink.href = `detalji.html?id=${upit.id_nekretnine}`;
  detailsLink.textContent = "Pogledaj detalje nekretnine";

  div.appendChild(idNekretnine);
  div.appendChild(tekst);
  div.appendChild(detailsLink);

  return div;
}
