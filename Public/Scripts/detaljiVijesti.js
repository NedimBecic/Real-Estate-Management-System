document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const vijestId = urlParams.get("id");

  if (vijestId) {
    loadVijestDetails(vijestId);
  }
});

function loadVijestDetails(id) {
  if (typeof PoziviAjax.getVijest === "function") {
    PoziviAjax.getVijest(id, (error, vijest) => {
      if (error) {
        fallbackToGetVijesti(id);
      } else {
        updateVijestContent(vijest);
      }
    });
  } else {
    fallbackToGetVijesti(id);
  }
}

function fallbackToGetVijesti(id) {
  PoziviAjax.getVijesti((error, vijesti) => {
    if (error) {
      console.error("Error loading vijesti:", error);
      return;
    }

    const vijest = vijesti.find((v) => v.id === parseInt(id));
    if (vijest) {
      updateVijestContent(vijest);
    } else {
      console.error("vijesti article not found");
    }
  });
}

function updateVijestContent(vijest) {
  document.getElementById("vijestiTitle").textContent = vijest.naslov;
  document.getElementById("vijestiDate").textContent = new Date(
    vijest.datum
  ).toLocaleDateString("bs-BA");
  document.getElementById("vijestiCategory").textContent = vijest.kategorija;
  document.getElementById("vijestiContent").textContent = vijest.tekst;

  const vijestiImage = document.getElementById("vijestiImage");
  vijestiImage.src = vijest.slika || "../Resources/headers/vijesti-header.jpg";
  vijestiImage.alt = vijest.naslov;

  setupShareButtons(vijest);
}

function setupShareButtons(vijest) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(vijest.naslov);

  const shareButtons = document.querySelectorAll(".share-button");
  shareButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const icon = this.querySelector("i").textContent;

      let shareUrl;
      switch (icon) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case "share":
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case "link":
          navigator.clipboard.writeText(window.location.href);
          alert("Link kopiran u clipboard!");
          return;
        case "email":
          shareUrl = `mailto:?subject=${title}&body=Pogledajte ovaj članak: ${url}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, "_blank", "width=600,height=400");
      }
    });
  });
}