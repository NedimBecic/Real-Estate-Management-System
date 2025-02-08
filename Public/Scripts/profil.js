document.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll(".nav-item");
  const contentSections = document.querySelectorAll(".content-section");
  const profileForm = document.getElementById("profile-form");
  let userData = null;

  function loadUserData() {
    PoziviAjax.getKorisnik((error, data) => {
      if (error) {
        console.error("Error fetching user data:", error);
        window.location.href = "prijava.html";
        return;
      }

      userData = typeof data === "string" ? JSON.parse(data) : data;
      document.getElementById("username").textContent = userData.username;
      document.getElementById("username-input").value = userData.username;
      document.getElementById("password-input").value = "";
    });
  }

  function loadInteresovanja() {
    PoziviAjax.getMojaInteresovanja((error, rawData) => {
      if (error) {
        console.error("Error fetching interesovanja:", error);
        return;
      }

      const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
      if (!Array.isArray(data)) {
        console.error("Invalid data format received");
        return;
      }

      const upiti = data.filter((item) => item.type === "upit");
      const zahtjevi = data.filter((item) => item.type === "zahtjev");
      const ponude = data.filter((item) => item.type === "ponuda");

      displayItems("requests-list", upiti);
      displayItems("demands-list", zahtjevi);
      displayItems("offers-list", ponude);
    });
  }

  function displayItems(containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (items.length === 0) {
      container.innerHTML = '<p class="item-card">Nema trenutnih interesovanja tog tipa.</p>';
      return;
    }

    items.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "item-card";

      let statusHtml = "";
      if (item.type === "zahtjev") {
        statusHtml = `<p>Status: ${
          item.odobren ? "Odobren" : "Na čekanju"
        }</p>`;
      } else if (item.type === "ponuda") {
        statusHtml = `<p>Status: ${
          item.odbijenaPonuda ? "Odbijena" : "Na čekanju"
        }</p>`;
      }

      itemElement.innerHTML = `
                <h3>Nekretnina ID: ${item.id_nekretnine}</h3>
                <p>${item.tekst}</p>
                ${statusHtml}
                <a href="detalji.html?id=${item.id_nekretnine}" class="view-details">
                    Pogledaj detalje
                </a>
            `;

      container.appendChild(itemElement);
    });
  }

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      if (this.classList.contains("logout")) {
        handleLogout();
        return;
      }

      navItems.forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");

      const targetSection = this.getAttribute("data-section");
      contentSections.forEach((section) => {
        section.classList.remove("active");
        if (section.id === `${targetSection}-section`) {
          section.classList.add("active");
        }
      });
    });
  });

  const confirmLogoutBtn = document.getElementById("confirmLogout");
  confirmLogoutBtn.addEventListener("click", function () {
    PoziviAjax.postLogout((error, data) => {
      if (error) {
        console.error("Error during logout:", error);
        return;
      }

      try {
        const response = JSON.parse(data);
        if (response.poruka === "Uspješno ste se odjavili") {
          setTimeout(() => {
            window.location.href = "prijava.html";
          }, 1500);
        }
      } catch (e) {
        console.error("Error processing logout response:", e);
      }
    });
  });

  profileForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const updatedData = {
      username: document.getElementById("username-input").value,
      password: document.getElementById("password-input").value,
    };

    PoziviAjax.putKorisnik(updatedData, (error, response) => {
      if (error) {
        console.error("Error updating profile:", error);
        alert("Greška prilikom ažuriranja profila.");
        return;
      }

      alert("Profil ažuriran uspješno!");
      loadUserData();
    });
  });

  loadUserData();
  loadInteresovanja();
});
