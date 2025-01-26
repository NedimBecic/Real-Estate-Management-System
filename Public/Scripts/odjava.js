document.addEventListener("DOMContentLoaded", function () {
  const confirmLogoutBtn = document.getElementById("confirmLogout");
  const cancelLogoutBtn = document.getElementById("cancelLogout");
  const logoutMessage = document.getElementById("logoutMessage");

  confirmLogoutBtn.addEventListener("click", function () {
    PoziviAjax.postLogout((error, data) => {
      if (error) {
        logoutMessage.innerHTML = `<p style="color: red;">Greška prilikom odjave: ${error}</p>`;
      } else {
        try {
          const response = JSON.parse(data);
          if (response.poruka === "Uspješno ste se odjavili") {
            logoutMessage.innerHTML =
              '<p style="color: green;">Uspješno ste se odjavili!</p>';
            setTimeout(() => {
              window.location.href = "prijava.html";
            }, 1500);
          } else {
            logoutMessage.innerHTML =
              '<p style="color: red;">Došlo je do greške.</p>';
          }
        } catch (e) {
          logoutMessage.innerHTML =
            '<p style="color: red;">Greška prilikom obrade odgovora.</p>';
        }
      }
    });
  });

  cancelLogoutBtn.addEventListener("click", function () {
    window.location.href = "nekretnine.html";
  });
});
