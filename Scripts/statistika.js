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

  const histogramData = statistika.histogramCijena(periodi, rasponiCijena);

  rasponiCijena.forEach((priceRange, j) => {
    const canvasContainer = document.createElement("div");
    canvasContainer.style.display = "inline-block";
    canvasContainer.style.width = "48%";
    canvasContainer.style.margin = "10px";

    const canvas = document.createElement("canvas");
    canvas.className = "histogram-canvas";
    canvasContainer.appendChild(canvas);
    histogramContainer.appendChild(canvasContainer);

    const ctx = canvas.getContext("2d");

    const labels = periodi.map((period) => `${period.od} - ${period.do}`);

    const dataForGraph = periodi.map((_, i) => {
      const entry = histogramData.find(
        (data) => data.indeksPerioda === i && data.indeksRasporedaCijena === j
      );
      return entry ? entry.brojNekretnina : 0;
    });

    const colorPalette = [
      "rgba(255, 99, 132, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(75, 192, 192, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(153, 102, 255, 0.6)",
      "rgba(255, 159, 64, 0.6)",
    ];

    const datasets = [
      {
        label: `Cijena ${priceRange.od} - ${priceRange.do}`,
        data: dataForGraph,
        borderWidth: 1,
        backgroundColor: periodi.map(
          (_, i) => colorPalette[i % colorPalette.length]
        ),
      },
    ];

    const plugin = {
      id: "customCanvasBackgroundColor",
      beforeDraw: (chart, args, options) => {
        const { ctx } = chart;
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = options.color || "#FFFFFF";
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
      },
    };

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 10,
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            grid: {
              display: false,
            },
            beginAtZero: true,
          },
        },
        plugins: {
          customCanvasBackgroundColor: {
            color: "#FFFFFF",
          },
          legend: {
            display: true,
            position: "top",
          },
        },
      },
      plugins: [plugin],
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

  const prosjecnaKvadratura = String(
    statistika.prosjecnaKvadratura(kriterij)
  ).concat("m²");

  const prosjecnaKvadraturaOutput = document.getElementById(
    "prosjecnaKvadraturaOutput"
  );
  prosjecnaKvadraturaOutput.value = prosjecnaKvadratura;

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

  const outlier = statistika.outlier(kriterij, naziv_svojstva);

  const outlierNektretnina = document.getElementById("outlierNekretnina");

  if(outlier) {
    outlierNektretnina.value = parseNekretnina(outlier);
  } else {
    outlierNektretnina.value = "Nije pronađena outlier nekretnina."
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

document.getElementById("submitButton4").addEventListener("click", function () {
  const usernameInput = document.getElementById("usernameInput");
  const korisnikNekretnineOutput = document.getElementById(
    "korisnikNekretnineOutput"
  );

  const korisnik = {
    username: usernameInput.value,
  };

  console.log(korisnik);

  const nekretnine = statistika.mojeNekretnine(korisnik);

  if (!nekretnine.length) {
    korisnikNekretnineOutput.value =
      "Nisu pronađene nekretnine koje sadrže upit sa unesenim korisničkim id-em.";
    return;
  }

  let nekretnineOutput = [];

  for (let i = 0; i < nekretnine.length; i++) {
    nekretnineOutput.push(parseNekretnina(nekretnine[i]));
    nekretnineOutput.push("\n\n");
  }

  korisnikNekretnineOutput.value = nekretnineOutput.join("");

  autoResizeTextarea(korisnikNekretnineOutput);
});

function validateInputs2(
  tipNekretnine,
  minKvadratura,
  maxKvadratura,
  minCijena,
  maxCijena,
  nazivSvojstva,
  flag,
  naziv,
  tipGrijanja,
  lokacija,
  godinaIzgradnje,
  datumObjave,
  opis
) {
  tipNekretnine = tipNekretnine.trim();
  const validTipovi = ["Stan", "Kuća", "Poslovni prostor"];
  if (!tipNekretnine) {
    alert("Tip nekretnine je obavezan.");
    return false;
  } else {
    tipNekretnine =
      tipNekretnine.charAt(0).toUpperCase() +
      tipNekretnine.slice(1).toLowerCase();
    if (!validTipovi.includes(tipNekretnine)) {
      alert(`Tip nekretnine mora biti jedan od: ${validTipovi.join(", ")}.`);
      return false;
    }
  }

  if (minKvadratura && (isNaN(minKvadratura) || minKvadratura <= 0)) {
    alert("Minimalna kvadratura mora biti broj veći od 0.");
    return false;
  }

  if (maxKvadratura && (isNaN(maxKvadratura) || maxKvadratura <= 0)) {
    alert("Maksimalna kvadratura mora biti broj veći od 0.");
    return false;
  }

  if (minKvadratura && maxKvadratura && minKvadratura > maxKvadratura) {
    alert("Minimalna kvadratura ne može biti veća od maksimalne kvadrature.");
    return false;
  }

  if (minCijena && (isNaN(minCijena) || minCijena <= 0)) {
    alert("Minimalna cijena mora biti broj veći od 0.");
    return false;
  }

  if (maxCijena && (isNaN(maxCijena) || maxCijena <= 0)) {
    alert("Maksimalna cijena mora biti broj veći od 0.");
    return false;
  }

  if (minCijena && maxCijena && minCijena > maxCijena) {
    alert("Minimalna cijena ne može biti veća od maksimalne cijene.");
    return false;
  }

  if (godinaIzgradnje) {
    const parsedGodinaIzgradnje = parseInt(godinaIzgradnje, 10);
    if (
      isNaN(parsedGodinaIzgradnje) ||
      parsedGodinaIzgradnje < 1900 ||
      parsedGodinaIzgradnje > 2024
    ) {
      alert(
        "Godina izgradnje mora biti broj između 1900 i 2024 (ili ostavite prazno)."
      );
      return false;
    }
    godinaIzgradnje = parsedGodinaIzgradnje; 
  }


  if (datumObjave) {
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})\.$/;
    const match = datumObjave.match(dateRegex);

    if (!match) {
      alert("Datum objave mora biti u formatu DD.MM.YYYY.");
      return false;
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (year < 1900 || year > 2024) {
      alert("Godina u datumu objave mora biti između 1900 i 2024.");
      return false;
    }

    if (month < 1 || month > 12) {
      alert("Mjesec u datumu objave mora biti između 1 i 12.");
      return false;
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      alert(
        `Dan u datumu objave mora biti između 1 i ${daysInMonth} za mjesec ${month}.`
      );
      return false;
    }
  }


  if (flag) {
    const validNazivi = [
      "id",
      "tip_nekretnine",
      "naziv",
      "kvadratura",
      "cijena",
      "tip_grijanja",
      "lokacija",
      "godina_izgradnje",
      "datum_objave",
      "opis",
      "upiti",
    ];
    nazivSvojstva = nazivSvojstva.trim();
    if (!validNazivi.includes(nazivSvojstva)) {
      alert(
        "Naziv svojstva nije validan. Mora biti jedno od sljedećih: " +
          validNazivi.join(", ")
      );
      return false;
    }

    return {
      tip_nekretnine: tipNekretnine,
      min_kvadratura: parseInt(minKvadratura),
      max_kvadratura: parseInt(maxKvadratura),
      min_cijena: parseInt(minCijena),
      max_cijena: parseInt(maxCijena),
      naziv_svojstva: nazivSvojstva,
      naziv: naziv.trim(),
      tip_grijanja: tipGrijanja.trim(),
      lokacija: lokacija.trim(),
      godina_izgradnje: godinaIzgradnje,
      datum_objave: datumObjave.trim(),
      opis: opis.trim(),
    };
  } else {
    return {
      tip_nekretnine: tipNekretnine,
      min_kvadratura: parseInt(minKvadratura),
      max_kvadratura: parseInt(maxKvadratura),
      min_cijena: parseInt(minCijena),
      max_cijena: parseInt(maxCijena),
    };
  }
}
