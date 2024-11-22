let StatistikaNekretnina = function () {
  let SpisakNekretnina = SpisakNekretnina();
  let listaNekretnina = [];
  let listaKorisnika = [];

  let init = function () {
    SpisakNekretnina.init(listaNekretnina, listaKorisnika);
  };

  let projecnaKvadratura = function (kriterij) {
    let listaNekretninaFilter = SpisakNekretnina.filtrirajNekretnine(kriterij);
    if (listaNekretninaFilter.length == 0) return 0;
    let sum = 0;
    for (let i = 0; i < listaNekretninaFilter.length; i++) {
      sum += listaNekretninaFilter[i].kvadratura;
    }
    return sum / listaNekretninaFilter.length;
  };

  let outlier = function (kriterij, nazivSvojstva) {
    let filteredNekretnine = SpisakNekretnina.filtrirajNekretnine(kriterij);
    if (filteredNekretnine.length == 0) {
      return null;
    }

    let sum = 0;
    for (let i = 0; i < filteredNekretnine.length; i++) {
      if (typeof filteredNekretnine[i][nazivSvojstva] !== "number") {
        return null;
      }
      sum += filteredNekretnine[i][nazivSvojstva];
    }
    let average = sum / filteredNekretnine.length;

    let max = -Infinity;
    let outlier = null;

    for (let i = 0; i < filteredNekretnine.length; i++) {
      let diff = Math.abs(filteredNekretnine[i][nazivSvojstva] - average);
      if (diff > max) {
        max = diff;
        outlier = filteredNekretnine[i];
      }
    }
    return outlier;
  };

  let mojeNekretnine = function (korisnik) {
    if (!korisnik) {
      return null;
    }
    const filteredNekretnine = listaNekretnina.filter((nekretnina) =>
      nekretnina.upiti.some((upit) => upit.korisnik_id === korisnik.korisnik_id)
    );
    filteredNekretnine.sort((a, b) => a.upiti.length - b.upiti.length);
    return filteredNekretnine;
  };

  let histogramCijena = function (periodi, rasponiCijena) {
    let histogramData = [];
    for (let i = 0; i < periodi.length; i++) {
      for (let j = 0; j < rasponiCijena.length; j++) {
        let count = 0;
        for (let k = 0; k < listaNekretnina.length; k++) {
          let year = new Date(listaNekretnina[k].datum_objave).getFullYear();
          if (year > periodi[i].od && year <= periodi[i].do) {
            if (
              listaNekretnina[k].cijena > rasponiCijena[j].od &&
              listaNekretnina[k] <= rasponiCijena[j].do
            ) {
              count++;
            }
          }
        }
        histogramData.push({
          indeksPerioda: i,
          indeksRasporedaCijena: j,
          brojNekretnina: count,
        });
      }
    }
    return histogramData;
  };
  return {
    init,
    projecnaKvadratura,
    outlier,
    mojeNekretnine,
    histogramCijena,
  };
};

let periodi = [
  { od: 2000, do: 2010 },
  { od: 2010, do: 2024 },
];

let rasponiCijena = [
  { od: 10000, do: 150000 },
  { od: 150000, do: 1000000 },
];

let result = histogramCijena(periodi, rasponiCijena);
console.log(result);

