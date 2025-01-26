let carousel;
let currentPage = 1;
let hasMoreUpiti = true;
let nekretninaId;
let carouselUpiti = [];
let currentIndex = 0;
let isAdmin = false;
let currentUser = null;

window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  nekretninaId = urlParams.get("id");

  if (nekretninaId) {
    initializeForm();
    loadNekretnina(nekretninaId);
    setupEventListeners();

    PoziviAjax.getKorisnik((error, user) => {
      if (!error && user) {
        currentUser = user;
        isAdmin = user.username === "admin";
      }
    });
  }
};


function loadNekretnina(id) {
  PoziviAjax.getNekretnina(id, (error, nekretninaData) => {
    if (error) {
      console.error("Error loading nekretnina:", error);
      return;
    }

    const nekretnina =
      typeof nekretninaData === "string"
        ? JSON.parse(nekretninaData)
        : nekretninaData;
    updateNekretnina(nekretnina);
    setupCarousel(nekretnina);
  });
}

function updateNekretnina(nekretnina) {
  document.querySelector(
    "#osnovno img"
  ).src = `/Resources/${nekretnina.id}.jpg`;
  document.querySelector(
    "#osnovno p:nth-child(2)"
  ).innerHTML = `<strong>Naziv:</strong> ${nekretnina.naziv}`;
  document.querySelector(
    "#osnovno p:nth-child(3)"
  ).innerHTML = `<strong>Kvadratura:</strong> ${nekretnina.kvadratura} m²`;
  document.querySelector(
    "#osnovno p:nth-child(4)"
  ).innerHTML = `<strong>Cijena:</strong> ${nekretnina.cijena} KM`;

  document.querySelector(
    "#kolona1 p:nth-child(1)"
  ).innerHTML = `<strong>Tip grijanja:</strong> ${nekretnina.tip_grijanja}`;
  document.querySelector("#kolona1 p:nth-child(2)").innerHTML = `
       <strong>Lokacija:</strong> <a href="#" onclick="loadTop5('${nekretnina.lokacija}'); return false;">${nekretnina.lokacija}</a>
       <div id="top5Container" class="hidden"></div>
   `;

  document.querySelector(
    "#kolona2 p:nth-child(1)"
  ).innerHTML = `<strong>Godina izgradnje:</strong> ${nekretnina.godina_izgradnje}`;
  document.querySelector(
    "#kolona2 p:nth-child(2)"
  ).innerHTML = `<strong>Datum objave oglasa:</strong> ${nekretnina.datum_objave}`;
  document.querySelector(
    "#opis p"
  ).innerHTML = `<strong>Opis:</strong> ${nekretnina.opis}`;
}

function setupCarousel(nekretnina) {
  const upitiContainer = document.getElementById("upiti");
  upitiContainer.innerHTML = "";

  if (!nekretnina.upiti || !Array.isArray(nekretnina.upiti)) {
    upitiContainer.innerHTML = "<p>No inquiries available</p>";
    return;
  }

  allUpiti = [...nekretnina.upiti];
  displayUpiti();
}

function displayUpiti() {
  const upitiContainer = document.getElementById("upiti");
  upitiContainer.innerHTML = "";

  allUpiti.forEach((upit) => {
    const upitDiv = document.createElement("div");
    upitDiv.className = "upit";
    upitDiv.innerHTML = `
      <p><strong>Username ${upit.korisnik_id}:</strong></p>
      <p>${upit.tekst_upita}</p>
    `;
    upitiContainer.appendChild(upitDiv);
  });

  carousel = postaviCarousel(
    upitiContainer,
    upitiContainer.getElementsByClassName("upit"),
    currentIndex
  );
}

function loadNextUpiti() {
  if (!hasMoreUpiti) return;

  PoziviAjax.getNextUpiti(nekretninaId, currentPage, (error, upitiData) => {
    if (error || !upitiData || upitiData.length === 0) {
      hasMoreUpiti = false;
      currentIndex = 0;
      displayUpiti();
      return;
    }

    const upiti =
      typeof upitiData === "string" ? JSON.parse(upitiData) : upitiData;
    allUpiti = [...allUpiti, ...upiti];
    currentPage++;
    currentIndex++;
    displayUpiti();
  });
}

let isTop5Visible = false;

function loadTop5(lokacija) {
  const container = document.getElementById("top5Container");

  if (isTop5Visible) {
    container.classList.add("hidden");
    isTop5Visible = false;
    return;
  }

  container.classList.remove("hidden");
  isTop5Visible = true;

  PoziviAjax.getTop5Nekretnina(lokacija, (error, data) => {
    if (error) {
      container.innerHTML = "<p>Error loading top 5 nekretnine</p>";
      return;
    }

    const nekretnine = typeof data === "string" ? JSON.parse(data) : data;

    const nekretnineDivs = nekretnine
      .map(
        (nekretnina) => `
           <div class="top5-item">
               <img src="/Resources/${nekretnina.id}.jpg" alt="${nekretnina.naziv}" />
               <p>${nekretnina.naziv}</p>
               <p>${nekretnina.cijena} KM</p>
               <a href="detalji.html?id=${nekretnina.id}">View Details</a>
           </div>
       `
      )
      .join("");

    container.innerHTML = `
           <h4>Top 5 Nekretnine in ${lokacija}</h4>
           <div class="top5-grid">${nekretnineDivs}</div>
       `;
  });
}

function carouselPrev() {
  if (!carousel) return;
  carousel.fnLijevo();
  currentIndex = carousel.getCurrentIndex();
}

function carouselNext() {
  if (!carousel) return;
  if (currentIndex === allUpiti.length - 1 && hasMoreUpiti) {
    loadNextUpiti();
  } else {
    carousel.fnDesno();
    currentIndex = carousel.getCurrentIndex();
  }
}

function initializeForm() {
  const interestType = document.getElementById("interestType");
  if (interestType) {
    interestType.addEventListener("change", updateFormFields);
  }
}

function setupEventListeners() {
  const form = document.getElementById("interestForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }
}

function updateFormFields() {
  const type = document.getElementById("interestType").value;
  const zahtjevFields = document.getElementById("zahtjevFields");
  const ponudaFields = document.getElementById("ponudaFields");

  if (zahtjevFields)
    zahtjevFields.style.display = type === "zahtjev" ? "block" : "none";
  if (ponudaFields) {
    ponudaFields.style.display = type === "ponuda" ? "block" : "none";
    if (type === "ponuda") loadRelatedOffers();
  }
}

function loadRelatedOffers() {
  const relatedOfferSelect = document.getElementById("relatedOffer");
  if (!relatedOfferSelect) return;

  PoziviAjax.getInteresovanja(nekretninaId, (error, data) => {
    if (error) {
      console.error("Error fetching interesovanja:", error);
      return;
    }

    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;

      const interesovanja = Array.isArray(parsedData) ? parsedData : [];

      const ponude = interesovanja.filter((i) => i.type === "ponuda");
      relatedOfferSelect.innerHTML =
        '<option value="">Bez vezane ponude</option>';

      if (isAdmin) {
        ponude.forEach((p) => {
          relatedOfferSelect.innerHTML += `<option value="${p.id}">${p.id} - ${p.tekst}</option>`;
        });
      } else {
        const userPonude = ponude.filter(
          (p) => p.korisnikId === currentUser.id
        );
        relatedOfferSelect.disabled = userPonude.length === 0;
        userPonude.forEach((p) => {
          relatedOfferSelect.innerHTML += `<option value="${p.id}">${p.id} - ${p.tekst}</option>`;
        });
      }
    } catch (e) {
      console.error("Error processing ponude:", e);
      relatedOfferSelect.innerHTML =
        '<option value="">Greška pri učitavanju ponuda</option>';
    }
  });
}


function createInteresovanjeElement(interesovanje) {
  const div = document.createElement("div");
  div.className = "interesovanje";

  let content = `
        <p><strong>ID:</strong> ${interesovanje.id}</p>
        <p><strong>Tekst:</strong> ${interesovanje.tekst}</p>
    `;

  if (interesovanje.type === "ponuda") {
    content += `<p><strong>Status:</strong> ${
      interesovanje.odbijenaPonuda ? "odbijena" : "odobrena"
    }</p>`;
  } else if (interesovanje.type === "zahtjev") {
    content += `
            <p><strong>Datum:</strong> ${new Date(
              interesovanje.trazeniDatum
            ).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${
              interesovanje.odobren ? "odobren" : "na čekanju"
            }</p>
        `;

    if (isAdmin || interesovanje.korisnikId === currentUser?.id) {
      content += `<p><strong>Dodatni detalji:</strong> ${
        interesovanje.detalji || "Nema"
      }</p>`;
    }
  }

  div.innerHTML = content;
  return div;
}

function handleFormSubmit(e) {
  e.preventDefault();

  const type = document.getElementById("interestType").value;
  const text = document.getElementById("text").value;

  if (!text) return;

  switch (type) {
    case "upit":
      PoziviAjax.postUpit(nekretninaId, text, handleResponse);
      break;
    case "zahtjev":
      const date = document.getElementById("requestedDate").value;
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
      const price = document.getElementById("price").value;
      const relatedOfferId = document.getElementById("relatedOffer").value;

      if (!price) return;

      PoziviAjax.postPonuda(
        nekretninaId,
        {
          tekst: text,
          ponudaCijene: price,
          datumPonude: new Date().toISOString(),
          idVezanePonude: relatedOfferId || null,
          odbijenaPonuda: false,
        },
        handleResponse
      );
      break;
  }
}

function handleResponse(error, data) {
  if (!error) {
    document.getElementById("interestForm").reset();
  } else {
    console.error("Error submitting interest:", error);
  }
}
