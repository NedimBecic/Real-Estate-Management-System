document.addEventListener("DOMContentLoaded", () => {
  const divStan = document.getElementById("stan");
  const divKuca = document.getElementById("kuca");
  const divPp = document.getElementById("pp");
  let nekretnine = SpisakNekretnina();

  function createNekretnineElement(nekretnina) {
    const nekretninaElement = document.createElement("div");
    nekretninaElement.classList.add(
      "nekretnina",
      nekretnina.tip_nekretnine.toLowerCase().replace(" ", "-")
    );
    nekretninaElement.id = nekretnina.id;

    nekretninaElement.innerHTML = `
            <img class="slika-nekretnine" src="/Resources/${nekretnina.id}.jpg" alt="${nekretnina.naziv}">
            <div class="detalji-nekretnine">
                <h3>${nekretnina.naziv}</h3>
                <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
                <p>Cijena: ${nekretnina.cijena} BAM</p>
            </div>
            <a href="detalji.html?id=${nekretnina.id}" class="detalji-dugme">Detalji</a>
        `;

    return nekretninaElement;
  }

  function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine) {
    const filtriraneNekretnine = instancaModula.filtrirajNekretnine({
      tip_nekretnine,
    });
    divReferenca.innerHTML = "";

    if (filtriraneNekretnine.length === 0) {
      divReferenca.innerHTML =
        "<p>Trenutno nema dostupnih nekretnina ovoga tipa.</p>";
      return;
    }

    filtriraneNekretnine.forEach((nekretnina) => {
      divReferenca.appendChild(createNekretnineElement(nekretnina));
    });
  }

  PoziviAjax.getNekretnine((error, data) => {
    if (!error) {
      nekretnine.init(data, []);
      console.log(nekretnine);
      spojiNekretnine(divStan, nekretnine, "Stan");
      spojiNekretnine(divKuca, nekretnine, "Kuća");
      spojiNekretnine(divPp, nekretnine, "Poslovni prostor");
    }
  });

  document.getElementById("dugmePretraga").addEventListener("click", () => {
    const kriterij = {
      min_cijena: parseFloat(document.getElementById("minCijena").value) || 0,
      max_cijena:
        parseFloat(document.getElementById("maxCijena").value) || Infinity,
      min_kvadratura:
        parseFloat(document.getElementById("minKvadratura").value) || 0,
      max_kvadratura:
        parseFloat(document.getElementById("maxKvadratura").value) || Infinity,
    };

    const filtriraneNekretnine = nekretnine.filtrirajNekretnine(kriterij);
    spojiNekretnine(divStan, nekretnine, "Stan");
    spojiNekretnine(divKuca, nekretnine, "Kuća");
    spojiNekretnine(divPp, nekretnine, "Poslovni prostor");
  });
});
