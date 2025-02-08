let currentIndex = 0;
let allUpiti = [];
let hasMoreUpiti = true;
let currentUser = null;
let isAdmin = false;

window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const nekretninaId = urlParams.get("id");

  if (nekretninaId) {
    initializeForm();
    loadNekretnina(nekretninaId);
    loadSimilarNekretnine(nekretninaId);

    PoziviAjax.getKorisnik((error, user) => {
      if (!error && user) {
        currentUser = user;
        isAdmin = user.username === "admin";
      }
    });
  }
};

function loadNekretnina(id) {
  PoziviAjax.getNekretnina(id, (error, data) => {
    if (error) {
      console.error("Error loading nekretnina:", error);
      return;
    }

    const nekretnina = typeof data === "string" ? JSON.parse(data) : data;
    updateNekretnina(nekretnina);
    loadUpiti(nekretnina);

    PoziviAjax.getNekretninaSlike(id, (error, slike) => {
      if (!error && slike) {
        const slikeData = typeof slike === "string" ? JSON.parse(slike) : slike;
        if (slikeData.header && slikeData.header.length > 0) {
          document.getElementById("slikaNekretnine").src =
            slikeData.header[0].path;
        }
      }
    });
  });
}

function updateNekretnina(nekretnina) {
  document.getElementById("nazivNekretnine").textContent = nekretnina.naziv;
  document.getElementById("lokacijaNekretnine").textContent =
    nekretnina.lokacija;
  document.getElementById(
    "kvadratura"
  ).textContent = `${nekretnina.kvadratura} m²`;
  document.getElementById(
    "cijena"
  ).textContent = `${nekretnina.cijena.toLocaleString("ba-BA")} KM`;
  document.getElementById("tipGrijanja").textContent = nekretnina.tip_grijanja;
  document.getElementById("godinaIzgradnje").textContent =
    nekretnina.godina_izgradnje;
  document.getElementById("opis").textContent = nekretnina.opis;
}

function loadUpiti(nekretnina) {
  const listaUpita = document.getElementById("listaUpita");
  listaUpita.innerHTML = "";

  if (!nekretnina.upiti || !Array.isArray(nekretnina.upiti)) {
    listaUpita.innerHTML = "<p>Nema dostupnih upita</p>";
    return;
  }

  allUpiti = [...nekretnina.upiti];
  displayUpiti();
}

function displayUpiti() {
  const listaUpita = document.getElementById("listaUpita");
  listaUpita.innerHTML = "";

  allUpiti.forEach((upit) => {
    const upitDiv = document.createElement("div");
    upitDiv.className = "upit-item";
    upitDiv.innerHTML = `
            <h4> Anonymous ${upit.korisnik_id}</h4>
            <p>${upit.tekst_upita}</p>
        `;
    listaUpita.appendChild(upitDiv);
  });
}

function loadSimilarNekretnine(currentId) {
  PoziviAjax.getNekretnine(async (error, nekretnine) => {
    if (error) return;

    const currentNekretnina = nekretnine.find(
      (n) => n.id === parseInt(currentId)
    );
    if (!currentNekretnina) return;

    const slicneNekretnine = nekretnine
      .filter(
        (n) =>
          n.tip_nekretnine === currentNekretnina.tip_nekretnine &&
          n.id !== parseInt(currentId)
      )
      .slice(0, 3);

    await displaySimilarNekretnine(slicneNekretnine);
  });
}

async function displaySimilarNekretnine(nekretnine) {
  const container = document.getElementById("listaSlicnihNekretnina");
  container.innerHTML = "";

  for (const nekretnina of nekretnine) {
    const card = document.createElement("div");
    card.className = "nekretnina-kartica";

    try {
      const slikeResponse = await new Promise((resolve, reject) => {
        PoziviAjax.getNekretninaSlike(nekretnina.id, (error, slike) => {
          if (error) reject(error);
          else resolve(slike);
        });
      });

      const slikeData =
        typeof slikeResponse === "string"
          ? JSON.parse(slikeResponse)
          : slikeResponse;
      const headerImage =
        slikeData.header && slikeData.header.length > 0
          ? slikeData.header[0].path
          : null;

      card.innerHTML = `
                <div class="nekretnina-overlay">
                    <div class="overlay-tags">
                        <span class="tag">Rent</span>
                        <span class="tag">${nekretnina.tip_nekretnine}</span>
                    </div>
                </div>
                <img src="${
                  headerImage || "../Resources/hero-section-background.jpg"
                }" alt="${nekretnina.naziv}" class="slika-nekretnine">
                <div class="detalji-nekretnine">
                    <div class="naslov-cijena">
                        <h3>${nekretnina.naziv}</h3>
                        <div class="cijena">${nekretnina.cijena.toLocaleString(
                          "ba-BA"
                        )} KM</div>
                    </div>
                    <div class="lokacija">
                        <i class="material-icons">location_on</i>
                        ${nekretnina.lokacija}
                    </div>
                    <div class="osobine">
                        <div class="osobina">
                            <div class="osobina-icon">
                                <i class="material-icons">apartment</i>
                            </div>
                            <span>${nekretnina.kvadratura} m²</span>
                        </div>
                        <div class="osobina">
                            <div class="osobina-icon">
                                <i class="material-icons">waves</i>
                            </div>
                            <span>${nekretnina.tip_grijanja}</span>
                        </div>
                    </div>
                    <div class="agent">
                        <div class="agent-info">
                            <div class="agent-photo">
                                <img src="../Resources/ostalo/profile-image.png" alt="Agent">
                            </div>
                            <div class="agent-name">By Anonymous</div>
                        </div>
                        <a href="detalji.html?id=${
                          nekretnina.id
                        }" class="view-details">
                            Detalji
                            <i class="material-icons">arrow_forward</i>
                        </a>
                    </div>
                </div>
            `;
      container.appendChild(card);
    } catch (error) {
      console.error("Error loading images:", error);
    }
  }
}

function initializeForm() {
  const tipInteresovanja = document.getElementById("tipInteresovanja");
  if (tipInteresovanja) {
    tipInteresovanja.addEventListener("change", updateFormFields);
  }

  const form = document.getElementById("formaInteresovanje");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }
}

function updateFormFields() {
  const type = document.getElementById("tipInteresovanja").value;
  const zahtjevPolja = document.getElementById("zahtjevPolja");
  const ponudaPolja = document.getElementById("ponudaPolja");

  if (zahtjevPolja) {
    zahtjevPolja.style.display = type === "zahtjev" ? "block" : "none";
  }
  if (ponudaPolja) {
    ponudaPolja.style.display = type === "ponuda" ? "block" : "none";
  }
}

function handleFormSubmit(e) {
  e.preventDefault();

  if (!currentUser) {
    alert("Morate biti prijavljeni da biste poslali upit.");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const nekretninaId = urlParams.get("id");
  const type = document.getElementById("tipInteresovanja").value;
  const text = document.getElementById("tekstUpita").value;

  if (!text) return;

  switch (type) {
    case "upit":
      PoziviAjax.postUpit(nekretninaId, text, handleResponse);
      break;
    case "zahtjev":
      const date = document.getElementById("datumZahtjeva").value;
      if (!date) return;

      PoziviAjax.postZahtjev(
        nekretninaId,
        {
          tekst: text,
          trazeniDatum: date,
        },
        handleResponse
      );
      break;
    case "ponuda":
      const price = document.getElementById("cijenaPonude").value;
      if (!price) return;

      PoziviAjax.postPonuda(
        nekretninaId,
        {
          tekst: text,
          ponudaCijene: price,
          datumPonude: new Date().toISOString(),
        },
        handleResponse
      );
      break;
  }
}

function handleResponse(error, data) {
  if (!error) {
    document.getElementById("formaInteresovanje").reset();
    loadNekretnina(new URLSearchParams(window.location.search).get("id"));
  } else {
    console.error("Error submitting interest:", error);
    alert("Došlo je do greške prilikom slanja upita.");
  }
}
