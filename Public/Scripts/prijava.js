document.addEventListener("DOMContentLoaded", function () {
  const tabButtons = document.querySelectorAll(".tab-button");
  const forms = document.querySelectorAll(".form-content");
  const togglePasswordButtons = document.querySelectorAll(".toggle-password");
  const loginForm = document.querySelector("#login-form form");
  const registrationForm = document.querySelector("#register-form form");
  const username = document.getElementById("username");
  const password = document.getElementById("password");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      forms.forEach((form) => {
        if (form.id === `${targetTab}-form`) {
          form.classList.remove("hidden");
        } else {
          form.classList.add("hidden");
        }
      });
    });
  });

  togglePasswordButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.previousElementSibling;
      if (input.type === "password") {
        input.type = "text";
        button.textContent = "visibility";
      } else {
        input.type = "password";
        button.textContent = "visibility_off";
      }
    });
  });

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    PoziviAjax.postLogin(username.value, password.value, function (err, data) {
      if (err != null) {
        try {
          const error = JSON.parse(err);
          if (error.greska) {
            var divElement = document.getElementById("areaBelow");
            divElement.innerHTML = `<h2>${error.greska}</h2>`;
          }
        } catch (e) {
          window.alert(err);
        }
      } else {
        var message = JSON.parse(data);
        if (message.poruka == "Neuspješna prijava") {
          var divElement = document.getElementById("areaBelow");
          divElement.innerHTML = "<p>Pogreši podaci za prijavu!</p>";
        } else {
          window.location.href = "http://localhost:3000/nekretnine.html";
        }
      }
    });
  });

  registrationForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const imePrezime = document.getElementById("imePrezime").value;
    const usernameReg = document.getElementById("usernameRegistration").value;
    const passwordReg = document.getElementById("passwordRegistration").value;

    if (!imePrezime || !usernameReg || !passwordReg) {
      document.getElementById("areaBelow").innerHTML =
        "<p>Sva polja su obavezna!</p>";
      return;
    }

    const [ime, prezime] = imePrezime.split(" ");
    if (!prezime) {
      document.getElementById("areaBelow").innerHTML =
        "<p>Unesite i ime i prezime!</p>";
      return;
    }

    PoziviAjax.postRegistration(
      ime,
      prezime,
      usernameReg,
      passwordReg,
      function (err, data) {
        if (err) {
          document.getElementById("areaBelow").innerHTML = `<p>${
            err.greska || "Greška pri registraciji"
          }</p>`;
        } else {
          document.getElementById("areaBelow").innerHTML =
            "<p>Uspješno ste se registrovali! Možete se prijaviti.</p>";
          document.querySelector('[data-tab="login"]').click();
        }
      }
    );
  });
});
