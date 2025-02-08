document.addEventListener("DOMContentLoaded", function () {
  const loginItem = document.getElementById("loginItem");
  const nekretnineItem = document.getElementById("nekretnineItem");
  const vijestiItem = document.getElementById("vijestiItem");
  const statistikaItem = document.getElementById("statistikaItem");
  const profilItem = document.getElementById("profilItem");

  function showLoggedInMenu() {
    nekretnineItem.classList.remove("hidden");
    vijestiItem.classList.remove("hidden");
    statistikaItem.classList.remove("hidden");
    profilItem.classList.remove("hidden");
    loginItem.classList.add("hidden");
  }

  function showLoggedOutMenu() {
    nekretnineItem.classList.add("hidden");
    vijestiItem.classList.add("hidden");
    statistikaItem.classList.add("hidden");
    profilItem.classList.add("hidden");
    loginItem.classList.remove("hidden");
  }

  [loginItem, nekretnineItem, vijestiItem, statistikaItem].forEach((item) => {
    if (item) item.classList.add("hidden");
  });

  PoziviAjax.getKorisnik((error, data) => {
    if (error) {
      showLoggedOutMenu();
    } else {
      showLoggedInMenu();
    }
  });
});
