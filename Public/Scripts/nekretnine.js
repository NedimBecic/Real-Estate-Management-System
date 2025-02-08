document.addEventListener("DOMContentLoaded", () => {
  const divStan = document.getElementById("stan");
  const divKuca = document.getElementById("kuca");
  const divPp = document.getElementById("pp");
  const citySearch = document.getElementById("citySearch");
  const cijenaSlider = document.getElementById("cijenaSlider");
  const kvadraturaSlider = document.getElementById("kvadraturaSlider");
  const cijenaValue = document.getElementById("cijenaValue");
  const kvadraturaValue = document.getElementById("kvadraturaValue");
  let nekretnine = SpisakNekretnina();

  function createNekretnineElement(nekretnina) {
    const nekretninaElement = document.createElement("div");
    nekretninaElement.classList.add(
      "nekretnina",
      nekretnina.tip_nekretnine.toLowerCase().replace(" ", "-")
    );
    nekretninaElement.id = nekretnina.id;

    nekretninaElement.innerHTML = `
        <div class="nekretnina-overlay">
            <div class="overlay-tags">
                <div class="tag">Rent</div>
                <div class="tag">${nekretnina.tip_nekretnine}</div>
            </div>
        </div>
        <img class="slika-nekretnine" src="../Resources/headers/hero-section-background.jpg" alt="${
          nekretnina.naziv
        }">
        <div class="detalji-nekretnine">
            <div class="nekretnina-info">
                <div class="naslov-cijena">
                    <h3>${nekretnina.naziv}</h3>
                    <div class="cijena">${nekretnina.cijena.toLocaleString(
                      "ba-BA"
                    )} BAM</div>
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
            </div>
            <div class="agent">
                <div class="agent-info">
                    <div class="agent-photo">
                        <img src="../Resources/ostalo/profile-image.png" alt="Agent">
                    </div>
                    <div>
                        <div>By Liza Archer</div>
                    </div>
                </div>
                <a href="detalji.html?id=${nekretnina.id}" class="view-details">
                    Detalji
                    <i class="material-icons">arrow_forward</i>
                </a>
            </div>
        </div>
    `;

    PoziviAjax.getHeaderImage(nekretnina.id, (error, headerImage) => {
      if (!error && headerImage) {
        const imgElement = nekretninaElement.querySelector(".slika-nekretnine");
        imgElement.src = headerImage.path;
        imgElement.onerror = function () {
          this.src = "../Resources/headers/hero-section-background.jpg";
        };
      }
    });

    return nekretninaElement;
  }

  function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine) {
    const searchText = citySearch.value.toLowerCase();
    const cijena = parseInt(cijenaSlider.value);
    const kvadratura = parseInt(kvadraturaSlider.value);

    const kriterij = {
      tip_nekretnine,
      min_cijena: 0,
      max_cijena: cijena,
      min_kvadratura: 0,
      max_kvadratura: kvadratura,
    };

    const filtriraneNekretnine = instancaModula
      .filtrirajNekretnine(kriterij)
      .filter(
        (nekretnina) =>
          !searchText ||
          nekretnina.lokacija.toLowerCase().includes(searchText) ||
          nekretnina.naziv.toLowerCase().includes(searchText)
      );

    divReferenca.innerHTML = "";

    if (filtriraneNekretnine.length === 0) {
      divReferenca.innerHTML =
        `<p class="not-available">Trenutno nema dostupnih nekretnina ovoga tipa.</p>`;
      return;
    }

    filtriraneNekretnine.forEach((nekretnina) => {
      divReferenca.appendChild(createNekretnineElement(nekretnina));
    });
  }

  function updateDisplayValues() {
    cijenaValue.textContent = `BAM 0 - BAM ${parseInt(
      cijenaSlider.value
    ).toLocaleString("ba-BA")}`;
    kvadraturaValue.textContent = `0 - ${kvadraturaSlider.value} m²`;
  }

  function updateNekretnine() {
    spojiNekretnine(divStan, nekretnine, "Stan");
    spojiNekretnine(divKuca, nekretnine, "Kuća");
    spojiNekretnine(divPp, nekretnine, "Poslovni prostor");
  }

  cijenaSlider.addEventListener("input", () => {
    updateDisplayValues();
  });

  kvadraturaSlider.addEventListener("input", () => {
    updateDisplayValues();
  });

  citySearch.addEventListener("input", () => {
    updateNekretnine();
  });

  document
    .getElementById("dugmePretraga")
    .addEventListener("click", updateNekretnine);

  PoziviAjax.getNekretnine((error, data) => {
    if (!error) {
      nekretnine.init(data, []);
      updateNekretnine();
    }
  });
});
