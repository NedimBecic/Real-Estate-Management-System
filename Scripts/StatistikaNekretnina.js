let StatistikaNekretnina = function () {
  let spisakNekretnina = SpisakNekretnina();

  let init = function () {
    spisakNekretnina.init(listaNekretnina, listaKorisnika);
  };

  let prosjecnaKvadratura = function (kriterij) {
    let listaNekretninaFilter = spisakNekretnina.filtrirajNekretnine(kriterij);
    if (listaNekretninaFilter.length == 0) return 0;
    let sum = 0;
    for (let i = 0; i < listaNekretninaFilter.length; i++) {
      sum += listaNekretninaFilter[i].kvadratura;
    }
    return sum / listaNekretninaFilter.length;
  };

  let outlier = function (kriterij, nazivSvojstva) {
    let filteredNekretnine = spisakNekretnina.filtrirajNekretnine(kriterij);
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
    let filteredNekretnine = [];
    let arr = spisakNekretnina.listaNekretnina;
    for (let i = 0; i < arr.length; i++) {
      let upiti = arr[i].upiti;
      for (let j = 0; j < upiti.length; j++) {
        if (upiti[j].korisnik_id === korisnik.id) {
          filteredNekretnine.push(arr[i]);
        }
      }
    }
    filteredNekretnine.sort((a, b) => a.upiti.length - b.upiti.length);
    return filteredNekretnine;
  };

  function histogramCijena(periodi, rasponiCijena) {
    let histogramData = [];
    for (let i = 0; i < periodi.length; i++) {
      for (let j = 0; j < rasponiCijena.length; j++) {
        let count = 0;
        for (let k = 0; k < listaNekretnina.length; k++) {
          let year = parseInt(listaNekretnina[k].datum_objave.split(".")[2]);
          if (year > periodi[i].od && year <= periodi[i].do) {
            if (
              listaNekretnina[k].cijena > parseInt(rasponiCijena[j].od) &&
              listaNekretnina[k].cijena <= parseInt(rasponiCijena[j].do)
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
  }
  return {
    init,
    prosjecnaKvadratura,
    outlier,
    mojeNekretnine,
    histogramCijena,
  };
};
