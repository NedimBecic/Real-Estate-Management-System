document.addEventListener("DOMContentLoaded", function () {
  loadVijesti();
});

function loadVijesti() {
  PoziviAjax.getVijesti((error, vijesti) => {
    if (error) {
      console.error("Error loading news:", error);
    } else if (vijesti) {
      displayVijesti(vijesti);
    }
  });
}

function displayVijesti(vijesti) {
  const container = document.querySelector(".vijesti-grid");
  if (!container) {
    console.error("News grid container not found");
    return;
  }

  container.innerHTML = "";

  vijesti.forEach((vijest) => {
    const vijestDiv = document.createElement("div");
    vijestDiv.className = "vijesti-card";
    vijestDiv.innerHTML = `
      <img src="${
        vijest.slika || "../Resources/hero-section-background.jpg"
      }" alt="${vijest.naslov}">
      <div class="vijesti-content">
        <h3>${vijest.naslov}</h3>
        <p>${vijest.tekst.substring(0, 150)}...</p>
        <div class="vijesti-meta">
          <span class="vijesti-datum">${new Date(
            vijest.datum
          ).toLocaleDateString("bs-BA")}</span>
          <a href="../html/detaljiVijesti.html?id=${vijest.id}" class="vijesti-more">
            Pročitaj više
            <i class="material-icons">arrow_forward</i>
          </a>
        </div>
      </div>
    `;
    container.appendChild(vijestDiv);
  });
}
