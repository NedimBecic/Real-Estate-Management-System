const listaNekretnina = [
  {
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2023.",
    opis: "Sociis natoque penatibus.",
    upiti: [
      {
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium.",
      },
      {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla.",
      },
    ],
  },
  {
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 32000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2009.",
    opis: "Sociis natoque penatibus.",
    upiti: [
      {
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium.",
      },
      {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla.",
      },
    ],
  },
  {
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2003.",
    opis: "Sociis natoque penatibus.",
    upiti: [
      {
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium.",
      },
      {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla.",
      },
    ],
  },
  {
    id: 2,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [
      {
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt.",
      },
    ],
  },
  {
    id: 3,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [
      {
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt.",
      },
    ],
  },
  {
    id: 4,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [
      {
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt.",
      },
    ],
  },
];

const listaKorisnika = [
  {
    id: 1,
    ime: "Neko",
    prezime: "Nekic",
    username: "username1",
  },
  {
    id: 2,
    ime: "Neko2",
    prezime: "Nekic2",
    username: "username2",
  },
];

var spisak;
var statistika;

window.onload = (event) => {
  spisak = SpisakNekretnina();
  spisak.init(listaNekretnina, listaKorisnika);

  statistika = StatistikaNekretnina();
  statistika.init();

  const inputs = document.querySelectorAll("input, textarea");
  inputs.forEach((input) => {
    input.value = "";
  });
};

function validateInput(input, type) {
  const rasponi = input.split(",");
  const currYear = new Date().getFullYear();

  for (let i = 0; i < rasponi.length; i++) {
    let pairs = rasponi[i]
      .trim()
      .split(" ")
      .filter((n) => n !== "");

    if (pairs.length !== 2) {
      alert(
        `Neispravan unos u rasponi"${type}" na poziciji ${
          i + 1
        }. Unesite par vrijednosti od i do.`
      );
      return false;
    }

    const num1 = parseInt(pairs[0], 10);
    const num2 = parseInt(pairs[1], 10);

    if (isNaN(num1) || isNaN(num2)) {
      alert(
        `Unesene vrijednosti moraju biti brojevi u "${type}" na poziciji ${
          i + 1
        }.`
      );
      return false;
    }

    if (num1 < 0 || num2 < 0) {
      alert(
        `Negativne vrijednosti nisu dozvoljene u "${type}" na poziciji ${
          i + 1
        }.`
      );
      return false;
    }

    if (type === "period") {
      if (num1 < 1900 || num1 > currYear || num2 < 1900 || num2 > currYear) {
        alert(
          `Godine moraju biti između 1900 i ${currYear} u rasponu"${type}a" na poziciji ${
            i + 1
          }.`
        );
        return false;
      }
    }

    if (num1 >= num2) {
      alert(
        `Vrijednost "od" mora biti manja od vrijednosti "do" u rasponu "${type}" na poziciji ${
          i + 1
        }.`
      );
      return false;
    }
  }
  return true;
}

function getArrayOfConstraints(rasponi) {
  let rasponiOdDo = rasponi.split(",");
  let rasponiArray = [];

  for (let i = 0; i < rasponiOdDo.length; i++) {
    let obj = rasponiOdDo[i].split(" ");
    obj = obj.filter(function (item) {
      return item !== "";
    });

    let arrObj = {
      od: parseInt(obj[0]),
      do: parseInt(obj[1]),
    };

    rasponiArray.push(arrObj);
  }
  return rasponiArray;
}

let lastRasponiPeriodaInput = "";
let lastRasponiCijenaInput = "";

document.getElementById("submitButton").addEventListener("click", function () {
  const rasponiPeriodaInputField = document.getElementById(
    "rasponiPeriodaInput"
  );
  const rasponiCijenaInputField = document.getElementById("rasponiCijenaInput");

  const rasponiPeriodaInput = rasponiPeriodaInputField.value.trim();
  const rasponiCijenaInput = rasponiCijenaInputField.value.trim();

  if (rasponiPeriodaInput === "" || rasponiCijenaInput === "") {
    alert("Unesite vrijednosti za oba polja.");
    return;
  }

  if (
    !validateInput(rasponiPeriodaInput, "period") ||
    !validateInput(rasponiCijenaInput, "cijena")
  ) {
    return;
  }

  if (
    rasponiPeriodaInput === lastRasponiPeriodaInput &&
    rasponiCijenaInput === lastRasponiCijenaInput
  ) {
    alert("Unijeli ste iste vrijednosti kao i prethodni put.");
    return;
  }

  lastRasponiPeriodaInput = rasponiPeriodaInput;
  lastRasponiCijenaInput = rasponiCijenaInput;

  let periodi = getArrayOfConstraints(rasponiPeriodaInput);
  let rasponiCijena = getArrayOfConstraints(rasponiCijenaInput);

  rasponiPeriodaInputField.value = "";
  rasponiCijenaInputField.value = "";

  crtajHistogram(periodi, rasponiCijena);
});

function crtajHistogram(periodi, rasponiCijena) {
  const placeholderText = document.getElementById("placeholder-text");
  if (placeholderText) {
    placeholderText.style.display = "none";
  }

  const histogramContainer = document.querySelector(".histogram-container");
  histogramContainer.innerHTML = "";

  PoziviAjax.getStatistikaPeriodi((error, rawData) => {
    if (error) {
      console.error("Error fetching period data:", error);
      return;
    }

    const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
    if (!Array.isArray(data)) {
      console.error("Nepravilan format podataka!");
      return;
    }

    const nekretnine = data.map((n) => ({
      datum_objave: new Date(n.datum_objave),
      cijena: n.cijena,
    }));

    rasponiCijena.forEach((priceRange, j) => {
      const canvasContainer = document.createElement("div");
      canvasContainer.style.width = "48%";
      canvasContainer.style.margin = "0";

      const canvas = document.createElement("canvas");
      canvas.className = "histogram-canvas";
      canvasContainer.appendChild(canvas);
      histogramContainer.appendChild(canvasContainer);

      const ctx = canvas.getContext("2d");
      const labels = periodi.map((period) => `${period.od} - ${period.do}`);

      const dataForGraph = periodi.map((period) => {
        return nekretnine.filter((n) => {
          const year = n.datum_objave.getFullYear();
          return (
            year > period.od &&
            year <= period.do &&
            n.cijena > priceRange.od &&
            n.cijena <= priceRange.do
          );
        }).length;
      });

      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: `Cijena ${priceRange.od} - ${priceRange.do}`,
              data: dataForGraph,
              backgroundColor: "#ff8c38",
              borderColor: "#e67a26",
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: 5 },
          plugins: {
            legend: {
              labels: {
                color: "#fff",
                font: {
                  family:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false, color: "#333" },
              ticks: { color: "#fff" },
            },
            y: {
              grid: { color: "#333" },
              ticks: { color: "#fff" },
            },
          },
        },
      });
    });
  });
}

document.getElementById("submitButton2").addEventListener("click", function () {
  const tipNekretnineInput = document.getElementById("tipNekretnineInput");
  const minKvadraturaInput = document.getElementById("minKvadraturaInput");
  const maxKvadraturaInput = document.getElementById("maxKvadraturaInput");
  const minCijenaInput = document.getElementById("minCijenaInput");
  const maxCijenaInput = document.getElementById("maxCijenaInput");

  const validatedInputs = validateInputs2(
    tipNekretnineInput.value,
    minKvadraturaInput.value,
    maxKvadraturaInput.value,
    minCijenaInput.value,
    maxCijenaInput.value,
    false
  );

  if (!validatedInputs) {
    return;
  }

  const {
    tip_nekretnine,
    min_kvadratura,
    max_kvadratura,
    min_cijena,
    max_cijena,
  } = validatedInputs;

  const kriterij = {
    tip_nekretnine: tip_nekretnine,
    min_kvadratura: min_kvadratura,
    max_kvadratura: max_kvadratura,
    min_cijena: min_cijena,
    max_cijena: max_cijena,
  };

  PoziviAjax.getStatistikaAverage(kriterij, (error, data) => {
    if (error) {
      console.error("Error calculating average:", error);
      return;
    }
    document.getElementById("prosjecnaKvadraturaOutput").value =
      data.prosjecnaKvadratura + "m²";
  });

  if (isNaN(kriterij.min_kvadratura)) {
    kriterij.min_kvadratura = "0";
  }
  if (isNaN(kriterij.max_kvadratura)) {
    kriterij.max_kvadratura = "0";
  }
  if (isNaN(kriterij.min_cijena)) {
    kriterij.min_cijena = "0";
  }
  if (isNaN(kriterij.max_cijena)) {
    kriterij.max_cijena = "0";
  }

  let prosjecnaKvadraturaTitle = document.getElementById(
    "prosjecnaKvadraturaTitle"
  );
  prosjecnaKvadraturaTitle.innerHTML = "Prosječna kvadratura (".concat(
    kriterij.tip_nekretnine,
    " ",
    kriterij.min_kvadratura,
    "m²-",
    kriterij.max_kvadratura,
    "m² ",
    kriterij.min_cijena,
    "KM-",
    kriterij.max_cijena,
    "KM)"
  );

  tipNekretnineInput.value = "";
  minKvadraturaInput.value = "";
  maxKvadraturaInput.value = "";
  minCijenaInput.value = "";
  maxCijenaInput.value = "";
});

function parseNekretnina(nekretnina) {
  const {
    id,
    tip_nekretnine,
    naziv,
    kvadratura,
    cijena,
    tip_grijanja,
    lokacija,
    godina_izgradnje,
    datum_objave,
    opis,
    upiti,
  } = nekretnina;

  let upitiText = "Upiti:\n";
  if (Array.isArray(upiti) && upiti.length > 0) {
    upiti.forEach((upit, index) => {
      upitiText += `  ${index + 1}. Korisnik ID: ${
        upit.korisnik_id
      }, Tekst upita: ${upit.tekst_upita}\n`;
    });
  } else {
    upitiText += "  Nema dostupnih upita.\n";
  }

  return `
    Nekretnina ID: ${id}
    Tip nekretnine: ${tip_nekretnine}
    Naziv: ${naziv}
    Kvadratura: ${kvadratura}m²
    Cijena: ${cijena}KM
    Tip grijanja: ${tip_grijanja}
    Lokacija: ${lokacija}
    Godina izgradnje: ${godina_izgradnje}
    Datum objave: ${datum_objave}
    Opis: ${opis}
    ${upitiText}`.trim();
}

function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}

const nekretninaTemplate = {
  id: null,
  tip_nekretnine: "",
  naziv: "",
  kvadratura: null,
  cijena: null,
  tip_grijanja: "",
  lokacija: "",
  godina_izgradnje: null,
  datum_objave: "",
  opis: "",
  upiti: [],
};

document.getElementById("submitButton3").addEventListener("click", function () {
  const tipNekretnineInput2 = document.getElementById("tipNekretnineInput2");
  const minKvadraturaInput2 = document.getElementById("minKvadraturaInput2");
  const maxKvadraturaInput2 = document.getElementById("maxKvadraturaInput2");
  const minCijenaInput2 = document.getElementById("minCijenaInput2");
  const maxCijenaInput2 = document.getElementById("maxCijenaInput2");
  const nazivSvojstvaInput = document.getElementById("svojstvoInput");
  const nazivInput = document.getElementById("nazivInput");
  const tipGrijanjaInput = document.getElementById("tipGrijanjaInput");
  const lokacijaInput = document.getElementById("lokacijaInput");
  const godinaIzgradnjeInput = document.getElementById("godinaIzgradnjeInput");
  const datumObjaveInput = document.getElementById("datumObjaveInput");
  const opisInput = document.getElementById("opisInput");

  const validatedInputs = validateInputs2(
    tipNekretnineInput2.value,
    minKvadraturaInput2.value,
    maxKvadraturaInput2.value,
    minCijenaInput2.value,
    maxCijenaInput2.value,
    nazivSvojstvaInput.value,
    true,
    nazivInput.value,
    tipGrijanjaInput.value,
    lokacijaInput.value,
    godinaIzgradnjeInput.value,
    datumObjaveInput.value,
    opisInput.value
  );

  if (!validatedInputs) {
    return;
  }

  const {
    tip_nekretnine,
    min_kvadratura,
    max_kvadratura,
    min_cijena,
    max_cijena,
    naziv_svojstva,
    naziv,
    tip_grijanja,
    lokacija,
    godina_izgradnje,
    datum_objave,
    opis,
  } = validatedInputs;

  const kriterij = {
    tip_nekretnine: tip_nekretnine,
    min_kvadratura: min_kvadratura,
    max_kvadratura: max_kvadratura,
    min_cijena: min_cijena,
    max_cijena: max_cijena,
    naziv: naziv,
    tip_grijanja: tip_grijanja,
    lokacija: lokacija,
    godina_izgradnje: godina_izgradnje,
    datum_objave: datum_objave,
    opis: opis,
  };

  PoziviAjax.getStatistikaOutlier(kriterij, (error, data) => {
    if (error) {
      console.error("Error finding outlier:", error);
      return;
    }
    document.getElementById("outlierNekretnina").value = parseNekretnina(data);
  });

  if (outlier) {
    outlierNektretnina.value = parseNekretnina(outlier);
  } else {
    outlierNektretnina.value = "Nije pronađena outlier nekretnina.";
  }

  autoResizeTextarea(outlierNektretnina);

  // if (isNaN(kriterij.min_kvadratura)) {
  //   kriterij.min_kvadratura = "0";
  // }
  // if (isNaN(kriterij.max_kvadratura)) {
  //   kriterij.max_kvadratura = "0";
  // }
  // if (isNaN(kriterij.min_cijena)) {
  //   kriterij.min_cijena = "0";
  // }
  // if (isNaN(kriterij.max_cijena)) {
  //   kriterij.max_cijena = "0";
  // }

  const outlierTitle = document.getElementById("outlierTitle");
  outlierTitle.innerHTML = "Outlier (".concat(
    kriterij.tip_nekretnine,
    " ",
    kriterij.min_kvadratura,
    "m²-",
    kriterij.max_kvadratura,
    "m² ",
    kriterij.min_cijena,
    "KM-",
    kriterij.max_cijena,
    "KM za svojstvo ",
    nazivSvojstvaInput.value,
    ")"
  );

  tipNekretnineInput2.value = "";
  minKvadraturaInput2.value = "";
  maxKvadraturaInput2.value = "";
  minCijenaInput2.value = "";
  maxCijenaInput2.value = "";
  nazivSvojstvaInput.value = "";
  nazivInput.value = "";
  tipGrijanjaInput.value = "";
  lokacijaInput.value = "";
  godinaIzgradnjeInput.value = "";
  datumObjaveInput.value = "";
  opisInput.value = "";
});

