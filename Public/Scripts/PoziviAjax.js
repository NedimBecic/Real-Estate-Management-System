const PoziviAjax = (() => {
  function ajaxRequest(method, url, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          callback(null, xhr.responseText);
        } else {
          callback({ status: xhr.status, statusText: xhr.statusText }, null);
        }
      }
    };
    xhr.send(data ? JSON.stringify(data) : null);
  }

  function impl_getKorisnik(fnCallback) {
    let ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function () {
      if (ajax.readyState == 4) {
        if (ajax.status == 200) {
          console.log("Uspješan zahtjev, status 200");
          fnCallback(null, JSON.parse(ajax.responseText));
        } else if (ajax.status == 401) {
          console.log("Neuspješan zahtjev, status 401");
          fnCallback("error", null);
        } else {
          console.log("Nepoznat status:", ajax.status);
        }
      }
    };

    ajax.open("GET", "http://localhost:3000/korisnik/", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send();
  }

  function impl_putKorisnik(noviPodaci, fnCallback) {
    if (!req.session.username) {
      return fnCallback(
        { status: 401, statusText: "Neautorizovan pristup" },
        null
      );
    }

    const { ime, prezime, username, password } = noviPodaci;

    const users = readJsonFile("korisnici");

    const loggedInUser = users.find(
      (user) => user.username === req.session.username
    );

    if (!loggedInUser) {
      return fnCallback(
        { status: 401, statusText: "Neautorizovan pristup" },
        null
      );
    }

    if (ime) loggedInUser.ime = ime;
    if (prezime) loggedInUser.prezime = prezime;
    if (username) loggedInUser.adresa = adresa;
    if (password) loggedInUser.brojTelefona = brojTelefona;

    saveJsonFile("korisnici", users);

    fnCallback(null, { poruka: "Podaci su uspješno ažurirani" });
  }

  function impl_postUpit(nekretnina_id, tekst_upita, fnCallback) {
    ajaxRequest(
      "POST",
      "/upit",
      {
        nekretnina_id: nekretnina_id,
        tekst_upita: tekst_upita,
      },
      fnCallback
    );
  }

  function impl_getNekretnine(fnCallback) {
    ajaxRequest("GET", "/nekretnine", null, (error, data) => {
      if (error) {
        fnCallback(error, null);
      } else {
        try {
          const nekretnine = JSON.parse(data);
          fnCallback(null, nekretnine);
        } catch (parseError) {
          fnCallback(parseError, null);
        }
      }
    });
  }

  function impl_postLogin(username, password, fnCallback) {
    var ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function () {
      if (ajax.readyState == 4) {
        if (ajax.status == 200) {
          fnCallback(null, ajax.response);
        } else if (ajax.readyState == 429) {
          fnCallback(ajax.responseText, null);
        } else {
          fnCallback(ajax.statusText, null);
        }
      }
    };
    ajax.open("POST", "http://localhost:3000/login", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    var objekat = {
      username: username,
      password: password,
    };
    forSend = JSON.stringify(objekat);
    ajax.send(forSend);
  }

  function impl_postLogout(fnCallback) {
    let ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function () {
      if (ajax.readyState == 4 && ajax.status == 200) {
        fnCallback(null, ajax.response);
      } else if (ajax.readyState == 4) {
        fnCallback(ajax.statusText, null);
      }
    };
    ajax.open("POST", "http://localhost:3000/logout", true);
    ajax.send();
  }

  function impl_getMojiUpiti(fnCallback) {
    ajaxRequest("GET", "/upiti/moji", null, fnCallback);
  }

  function impl_getNekretnina(nekretnina_id, fnCallback) {
    ajaxRequest("GET", `/nekretnina/${nekretnina_id}`, null, fnCallback);
  }

  function impl_getTop5Nekretnina(lokacija, fnCallback) {
    ajaxRequest(
      "GET",
      `/nekretnine/top5?lokacija=${encodeURIComponent(lokacija)}`,
      null,
      fnCallback
    );
  }

  function impl_getNextUpiti(nekretnina_id, page, fnCallback) {
    ajaxRequest(
      "GET",
      `/next/upiti/nekretnina${nekretnina_id}?page=${page}`,
      null,
      fnCallback
    );
  }

  function impl_getInteresovanja(nekretninaId, fnCallback) {
    ajaxRequest(
      "GET",
      `/nekretnina/${nekretninaId}/interesovanja`,
      null,
      fnCallback
    );
  }

  function impl_postPonuda(nekretninaId, data, fnCallback) {
    ajaxRequest("POST", `/nekretnina/${nekretninaId}/ponuda`, data, fnCallback);
  }

  function impl_postZahtjev(nekretninaId, data, fnCallback) {
    ajaxRequest(
      "POST",
      `/nekretnina/${nekretninaId}/zahtjev`,
      data,
      fnCallback
    );
  }

  function impl_updateZahtjev(nekretninaId, zahtjevId, data, fnCallback) {
    ajaxRequest(
      "PUT",
      `/nekretnina/${nekretninaId}/zahtjev/${zahtjevId}`,
      data,
      fnCallback
    );
  }

  function impl_getMojaInteresovanja(fnCallback) {
    ajaxRequest("GET", "/moja-interesovanja", null, fnCallback);
  }

  function impl_getNekretninaSlike(nekretninaId, fnCallback) {
    ajaxRequest("GET", `/nekretnina/${nekretninaId}/slike`, null, fnCallback);
  }

  function impl_getHeaderImage(nekretninaId, fnCallback) {
    impl_getNekretninaSlike(nekretninaId, (error, data) => {
      if (error) {
        fnCallback(error, null);
      } else {
        try {
          const slike = JSON.parse(data);
          const headerImage = slike.header[0] || null;
          fnCallback(null, headerImage);
        } catch (parseError) {
          fnCallback(parseError, null);
        }
      }
    });
  }

  function impl_getVijesti(fnCallback) {
    ajaxRequest("GET", "/vijesti", null, (error, data) => {
      if (error) {
        fnCallback(error, null);
      } else {
        try {
          const vijesti = JSON.parse(data);
          fnCallback(null, vijesti);
        } catch (error) {
          fnCallback(error, null);
        }
      }
    });
  }

  function impl_getVijest(id, fnCallback) {
    ajaxRequest("GET", `/vijest/${id}`, null, (error, data) => {
      if (error) {
        fnCallback(error, null);
      } else {
        try {
          const vijest = JSON.parse(data);
          fnCallback(null, vijest);
        } catch (error) {
          fnCallback(error, null);
        }
      }
    });
  }

  function impl_getIstaknutaVijest(fnCallback) {
    ajaxRequest("GET", "/vijesti/istaknuta", null, (error, data) => {
      if (error) {
        fnCallback(error, null);
      } else {
        try {
          const vijest = JSON.parse(data);
          fnCallback(null, vijest);
        } catch (error) {
          fnCallback(error, null);
        }
      }
    });
  }

  function impl_getIstaknutaVijest(fnCallback) {
    ajaxRequest("GET", "/vijesti/istaknuta", null, (error, data) => {
      if (error) {
        fnCallback(error, null);
      } else {
        try {
          const vijest = JSON.parse(data);
          fnCallback(null, vijest);
        } catch (error) {
          fnCallback(error, null);
        }
      }
    });
  }

  function impl_getStatistikaPeriodi(fnCallback) {
    ajaxRequest("GET", "/statistika/nekretnine/periodi", null, fnCallback);
  }

  function impl_getStatistikaAverage(criteria, fnCallback) {
    const params = new URLSearchParams(criteria);
    ajaxRequest(
      "GET",
      `/statistika/nekretnine/average?${params}`,
      null,
      fnCallback
    );
  }

  function impl_getStatistikaOutlier(criteria, fnCallback) {
    const params = new URLSearchParams(criteria);
    ajaxRequest(
      "GET",
      `/statistika/nekretnine/outlier?${params}`,
      null,
      fnCallback
    );
  }

  function impl_postRegistration(ime, prezime, username, password, fnCallback) {
    const ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
      if (ajax.readyState == 4) {
        if (ajax.status == 200) {
          fnCallback(null, ajax.response);
        } else {
          fnCallback(JSON.parse(ajax.responseText), null);
        }
      }
    };

    ajax.open("POST", "http://localhost:3000/register", true);
    ajax.setRequestHeader("Content-Type", "application/json");
    const data = {
      ime: ime,
      prezime: prezime,
      username: username,
      password: password,
    };
    ajax.send(JSON.stringify(data));
  }


  return {
    postLogin: impl_postLogin,
    postLogout: impl_postLogout,
    getKorisnik: impl_getKorisnik,
    putKorisnik: impl_putKorisnik,
    postUpit: impl_postUpit,
    getNekretnine: impl_getNekretnine,
    getTop5Nekretnina: impl_getTop5Nekretnina,
    getMojiUpiti: impl_getMojiUpiti,
    getNekretnina: impl_getNekretnina,
    getNextUpiti: impl_getNextUpiti,
    getInteresovanja: impl_getInteresovanja,
    postPonuda: impl_postPonuda,
    postZahtjev: impl_postZahtjev,
    updateZahtjev: impl_updateZahtjev,
    getMojaInteresovanja: impl_getMojaInteresovanja,
    getNekretninaSlike: impl_getNekretninaSlike,
    getHeaderImage: impl_getHeaderImage,
    getVijesti: impl_getVijesti,
    getIstaknutaVijest: impl_getIstaknutaVijest,
    getStatistikaPeriodi: impl_getStatistikaPeriodi,
    getStatistikaAverage: impl_getStatistikaAverage,
    getStatistikaOutlier: impl_getStatistikaOutlier,
    getVijest: impl_getVijest,
    postRegistration: impl_postRegistration
  };
})();
