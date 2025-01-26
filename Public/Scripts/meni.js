document.addEventListener("DOMContentLoaded", function () {

  const loginItem = document.getElementById("loginItem");
  const profilItem = document.getElementById("profilItem");
  const nekretnineItem = document.getElementById("nekretnineItem");
  const vijestiItem = document.getElementById("vijestiItem");
  const statistikaItem = document.getElementById("statistikaItem");
  const mojiUpitiItem = document.getElementById("mojiUpitiItem");
  const odjavaItem = document.getElementById("odjavaItem");

  function showLoggedInMenu() {
    profilItem.classList.remove("hidden");
    nekretnineItem.classList.remove("hidden");
    vijestiItem.classList.remove("hidden");
    statistikaItem.classList.remove("hidden");
    mojiUpitiItem.classList.remove("hidden");
    loginItem.classList.add("hidden");
    odjavaItem.classList.remove("hidden");
  }

  function showLoggedOutMenu() {
    profilItem.classList.add("hidden");
    nekretnineItem.classList.remove("hidden");
    vijestiItem.classList.add("hidden");
    statistikaItem.classList.add("hidden");
    mojiUpitiItem.classList.add("hidden");
    loginItem.classList.remove("hidden");
    odjavaItem.classList.add("hidden");
  }

  PoziviAjax.getKorisnik((error, data) => {
    if (error) {
      showLoggedOutMenu();
    } else {
      showLoggedInMenu();
    }
  });
});
