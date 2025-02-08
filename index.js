const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs").promises; // Using asynchronus API for file read and write
const bcrypt = require("bcrypt");
const { time } = require("console");
const db = require("./database.js");
const { dataMigration } = require("./dataMigration.js");

const app = express();
const PORT = 3000;

const loginAttempts = {
  count: 0,
  timestamp: new Date().getTime(),
  lockedOut: false,
};

app.use(
  session({
    secret: "tajna sifra",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.static(__dirname + "/public"));

app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("/prijava.html");
});

async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, "public/html", fileName);
  try {
    const content = await fs.readFile(htmlPath, "utf-8");
    res.send(content);
  } catch (error) {
    console.error("Error serving HTML file:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
}

const routes = [
  { route: "/nekretnine.html", file: "nekretnine.html" },
  { route: "/detalji.html", file: "detalji.html" },
  { route: "/meni.html", file: "meni.html" },
  { route: "/prijava.html", file: "prijava.html" },
  { route: "/profil.html", file: "profil.html" },
  { route: "/statistika.html", file: "statistika.html" },
  { route: "/vijesti.html", file: "vijesti.html" },
  { route: "/mojiUpiti.html", file: "mojiUpiti.html" },
  { route: "/odjava.html", file: "odjava.html" },
];

routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

// async function readJsonFile(filename) {
//   const filePath = path.join(__dirname, "data", `${filename}.json`);
//   try {
//     const rawdata = await fs.readFile(filePath, "utf-8");
//     return JSON.parse(rawdata);
//   } catch (error) {
//     throw error;
//   }
// }

// async function saveJsonFile(filename, data) {
//   const filePath = path.join(__dirname, "data", `${filename}.json`);
//   try {
//     await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
//   } catch (error) {
//     throw error;
//   }
// }

const checkLoginAttempts = (req, res, next) => {
  if (loginAttempts.lockedOut) {
    const currentTime = new Date().getTime();
    const timePassed = currentTime - loginAttempts.timestamp;
    const remaining = 60000 - timePassed;

    if (remaining > 0) {
      return res.status(429).json({
        greska: "Previse neuspjesnih pokusaja. Pokusajte ponovo za 1 minutu.",
      });
    } else {
      loginAttempts.count = 0;
      loginAttempts.timestamp = null;
      loginAttempts.lockedOut = false;
    }
  }
  next();
};

app.use("/login", checkLoginAttempts);

app.post("/login", async (req, res) => {
  const jsonObj = req.body;

  try {
    const korisnik = await db.Korisnik.findOne({
      where: { username: jsonObj.username },
    });

    let found = false;

    if (korisnik) {
      const isPasswordMatched = await bcrypt.compare(
        jsonObj.password,
        korisnik.password
      );

      if (isPasswordMatched) {
        req.session.username = korisnik.username;
        found = true;
      }
    }

    const status = found ? "uspješno" : "neuspješno";
    const currentDateTime = new Date().toISOString();
    const loginAttemptDetails = `[${currentDateTime}] - username: ${jsonObj.username} - status: ${status}`;

    fs.appendFile("imenik.txt", `${loginAttemptDetails}\r\n`, (err) => {
      if (err) {
        console.error("Greska prilikom upisavanja u datoteku:", err);
      } else {
        console.log("Novi red uspjesno dodan!");
      }
    });

    if (found) {
      loginAttempts.count = 0;
      loginAttempts.timestamp = null;
      loginAttempts.lockedOut = false;
      res.json({ poruka: "Uspješna prijava" });
    } else {
      loginAttempts.count++;
      loginAttempts.timestamp = new Date().getTime();
      if (loginAttempts.count == 3) {
        loginAttempts.lockedOut = true;
        return res.status(429).json({
          greska: "Previse neuspjesnih pokusaja. Pokusajte ponovo za 1 minutu.",
        });
      }

      return res.json({ poruka: "Neuspješna prijava" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.post("/register", async (req, res) => {
  const { ime, prezime, username, password } = req.body;

  try {
    const existingUser = await db.Korisnik.findOne({
      where: { username: username },
    });

    if (existingUser) {
      return res.status(400).json({
        greska: "Korisničko ime već postoji",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.Korisnik.create({
      ime: ime,
      prezime: prezime,
      username: username,
      password: hashedPassword,
      admin: false,
    });

    res.status(200).json({
      poruka: "Uspješna registracija",
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      greska: "Došlo je do greške prilikom registracije",
    });
  }
});

app.post("/logout", (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      res.status(500).json({ greska: "Internal Server Error" });
    } else {
      res.status(200).json({ poruka: "Uspješno ste se odjavili" });
    }
  });
});

app.get("/korisnik", async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }
  const username = req.session.username;

  try {
    const user = await db.Korisnik.findOne({
      where: { username: username },
    });

    if (!user) {
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    const userData = {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      password: user.password, 
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.post("/upit", async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  const { nekretnina_id, tekst_upita } = req.body;

  try {
    const loggedInUser = await db.Korisnik.findOne({
      where: { username: req.session.username },
    });

    const nekretnina = await db.Nekretnina.findByPk(nekretnina_id);

    if (!nekretnina) {
      return res.status(400).json({
        greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji`,
      });
    }

    const existingUpitsCount = await db.Upit.count({
      where: {
        KorisnikId: loggedInUser.id,
        NekretninaId: nekretnina_id,
      },
    });

    if (existingUpitsCount >= 3) {
      return res.status(429).json({
        greska: "Previse upita za istu nekretninu.",
      });
    }

    await db.Upit.create({
      tekst: tekst_upita,
      KorisnikId: loggedInUser.id,
      NekretninaId: nekretnina_id,
    });

    res.status(200).json({ poruka: "Upit je uspješno dodan" });
  } catch (error) {
    console.error("Error processing query:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/upiti/moji", async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }
  try {
    const loggedInUser = await db.Korisnik.findOne({
      where: { username: req.session.username },
    });

    if (!loggedInUser) {
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    const upiti = await db.Upit.findAll({
      where: { KorisnikId: loggedInUser.id },
      include: [db.Nekretnina],
      attributes: ["NekretninaId", "tekst"],
    });

    const filteredUpiti = upiti.map((upit) => ({
      id_nekretnine: upit.NekretninaId,
      tekst_upita: upit.tekst,
    }));

    if (filteredUpiti.length > 0) {
      res.status(200).json(filteredUpiti);
    } else {
      res.status(404).json([]);
    }
  } catch (error) {
    console.error("Error processing query:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.put("/korisnik", async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  const { ime, prezime, username, password } = req.body;

  try {
    const loggedInUser = await db.Korisnik.findOne({
      where: { username: req.session.username },
    });

    if (!loggedInUser) {
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    const updateData = {};
    if (ime) updateData.ime = ime;
    if (prezime) updateData.prezime = prezime;
    if (username) updateData.username = username;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await loggedInUser.update(updateData);

    res.status(200).json({ poruka: "Podaci su uspješno ažurirani" });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/nekretnine", async (req, res) => {
  try {
    const nekretnineData = await db.Nekretnina.findAll();
    res.json(nekretnineData);
  } catch (error) {
    console.error("Error fetching properties data:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/nekretnine/top5", async (req, res) => {
  const { lokacija } = req.query;
  try {
    const nekretnine = await db.Nekretnina.findAll({
      where: { lokacija: lokacija },
      order: [["datum_objave", "DESC"]],
      limit: 5,
    });
    res.status(200).json(nekretnine);
  } catch (error) {
    res.status(500).json({ greska: "Greska prilikom filtriranja" });
  }
});

async function getLast3Upits(req) {
  const nekretnina = await db.Nekretnina.findByPk(Number(req.params.id), {
    include: [
      {
        model: db.Upit,
        include: [db.Korisnik],
        order: [["createdAt", "DESC"]],
      },
    ],
  });

  if (!nekretnina) {
    return {
      status: 404,
      data: {
        greska: `Ne postoji nekretnina sa Id: ${req.params.id}`,
      },
    };
  }

  const formattedNekretnina = nekretnina.toJSON();
  formattedNekretnina.upiti = nekretnina.Upits.slice(-3)
    .reverse()
    .map((upit) => ({
      korisnik_id: upit.KorisnikId,
      tekst_upita: upit.tekst,
    }));

  return {
    status: 200,
    data: formattedNekretnina,
  };
}

app.get("/nekretnina/:id", async (req, res) => {
  try {
    const result = await getLast3Upits(req);
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error("Error fetching property details:", error);
    res.status(500).json({ greska: "Greska prilikom traženja nekretnine" });
  }
});

app.get("/next/upiti/nekretnina:id", async (req, res) => {
  try {
    const { page } = req.query;
    const { id } = req.params;
    const pageNum = Number(page);

    if (pageNum < 0) {
      return res.status(200).json([]);
    }

    if (pageNum === 0) {
      const result = await getLast3Upits(req);
      return res.status(result.status).json(result.data);
    }

    const nekretnina = await db.Nekretnina.findByPk(Number(id), {
      include: [
        {
          model: db.Upit,
          include: [db.Korisnik],
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!nekretnina) {
      return res.status(404).json({
        greska: `Ne postoji nekretnina sa Id: ${id}`,
      });
    }

    const total = nekretnina.Upits.length;
    let startIndex = total - 3 * (pageNum + 1);
    let endIndex = startIndex + 3;

    if (startIndex < 0) startIndex = 0;
    if (endIndex < 0) endIndex = 0;

    const remainingUpiti = nekretnina.Upits.slice(startIndex, endIndex)
      .map((upit) => ({
        korisnik_id: upit.KorisnikId,
        tekst_upita: upit.tekst,
      }))
      .reverse();

    if (remainingUpiti.length === 0) {
      return res.status(404).json([]);
    }

    res.status(200).json(remainingUpiti);
  } catch (error) {
    console.error("Error processing query:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/nekretnina/:id/interesovanja", async (req, res) => {
  try {
    const nekretnina = await db.Nekretnina.findByPk(req.params.id);
    if (!nekretnina) {
      return res.status(404).json({ greska: "Nekretnina nije pronađena" });
    }

    const interesovanja = await nekretnina.getInteresovanja();
    const loggedInUser = req.session.username
      ? await db.Korisnik.findOne({ where: { username: req.session.username } })
      : null;

    if (loggedInUser?.admin) {
      return res.json(interesovanja);
    }

    const filteredInteresovanja = interesovanja
      .filter((item) => {
        if (item instanceof db.Zahtjev) {
          return loggedInUser?.id === item.KorisnikId;
        }
        return true;
      })
      .map((item) => {
        let data = item.toJSON();

        if (item instanceof db.Ponuda) {
          delete data.cijenaPonude;
          delete data.datumPonude;
          delete data.createdAt;
          delete data.updatedAt;

          if (
            loggedInUser?.id === data.KorisnikId ||
            data.vezanePonude?.some((p) => p.KorisnikId === loggedInUser?.id)
          ) {
            data.cijenaPonude = item.cijenaPonude;
          }
        }

        if (
          item instanceof db.Zahtjev &&
          loggedInUser?.id === data.KorisnikId
        ) {
          return data;
        } else if (item instanceof db.Zahtjev) {
          delete data.trazeniDatum;
          delete data.createdAt;
          delete data.updatedAt;
        }

        if (data.Korisnik) {
          data.Korisnik = {
            id: data.Korisnik.id,
            username: data.Korisnik.username,
          };
        }

        return data;
      });

    res.json(filteredInteresovanja);
  } catch (error) {
    console.error(error);
    res.status(500).json({ greska: "Greška pri dohvatanju interesovanja" });
  }
});


app.post("/nekretnina/:id/ponuda", async (req, res) => {
  try {
    if (!req.session.username) {
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    const { tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda } =
      req.body;
    const user = await db.Korisnik.findOne({
      where: { username: req.session.username },
    });
    const nekretnina = await db.Nekretnina.findByPk(req.params.id);

    if (!nekretnina) {
      return res.status(404).json({ greska: "Nekretnina nije pronađena" });
    }

    if (idVezanePonude) {
      const vezanaPonuda = await db.Ponuda.findByPk(idVezanePonude, {
        include: [{ model: db.Ponuda, as: "vezanePonude" }],
      });

      if (!vezanaPonuda) {
        return res.status(404).json({ greska: "Vezana ponuda nije pronađena" });
      }

      if (
        vezanaPonuda.odbijenaPonuda ||
        vezanaPonuda.vezanePonude?.some((p) => p.odbijenaPonuda)
      ) {
        return res
          .status(400)
          .json({ greska: "Ne možete dodati ponudu na odbijeni lanac ponuda" });
      }

      if (!user.admin && user.id !== vezanaPonuda.KorisnikId) {
        return res
          .status(403)
          .json({ greska: "Nemate pravo dodati ponudu na tuđu ponudu" });
      }
    }

    const novaPonuda = await db.Ponuda.create({
      tekst,
      cijenaPonude: ponudaCijene,
      datumPonude,
      odbijenaPonuda,
      KorisnikId: user.id,
      NekretninaId: nekretnina.id,
      vezanaPonudaId: idVezanePonude,
    });

    res.status(201).json(novaPonuda);
  } catch (error) {
    console.error(error);
    res.status(500).json({ greska: "Greška pri kreiranju ponude" });
  }
});

app.post("/nekretnina/:id/zahtjev", async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  const { tekst, trazeniDatum } = req.body;
  const nekretninaId = parseInt(req.params.id);

  try {
    const user = await db.Korisnik.findOne({
      where: { username: req.session.username },
    });

    const nekretnina = await db.Nekretnina.findByPk(nekretninaId);
    if (!nekretnina) {
      return res.status(404).json({
        greska: `Nekretnina sa id-em ${nekretninaId} ne postoji`,
      });
    }

    const requestDate = new Date(trazeniDatum);
    if (isNaN(requestDate.getTime())) {
      return res.status(404).json({
        greska: "Neispravan format datuma",
      });
    }

    const currentDate = new Date();

    requestDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (requestDate < currentDate) {
      return res.status(404).json({
        greska: "Traženi datum ne može biti u prošlosti",
      });
    }

    const zahtjev = await db.Zahtjev.create({
      tekst: tekst,
      trazeniDatum: requestDate,
      KorisnikId: user.id,
      NekretninaId: nekretninaId,
    });

    res.status(200).json({
      poruka: "Zahtjev uspješno kreiran",
    });
  } catch (error) {
    console.error("Error creating zahtjev:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.put("/nekretnina/:id/zahtjev/:zid", async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  const { odobren, addToTekst } = req.body;
  const nekretninaId = parseInt(req.params.id);
  const zahtjevId = parseInt(req.params.zid);

  try {
    const admin = await db.Korisnik.findOne({
      where: {
        username: req.session.username,
        admin: true,
      },
    });

    if (!admin) {
      return res
        .status(403)
        .json({ greska: "Samo admin može odgovoriti na zahtjev" });
    }

    if (!odobren && !addToTekst) {
      return res.status(400).json({
        greska: "addToTekst je obavezan kada je odobren=false",
      });
    }

    const zahtjev = await db.Zahtjev.findOne({
      where: {
        id: zahtjevId,
        NekretninaId: nekretninaId,
      },
    });

    if (!zahtjev) {
      return res.status(404).json({ greska: "Zahtjev nije pronađen" });
    }

    const updatedText = addToTekst
      ? `${zahtjev.tekst} ODGOVOR ADMINA: ${addToTekst}`
      : zahtjev.tekst;

    await zahtjev.update({
      odobren: odobren,
      tekst: updatedText,
    });

    res.status(200).json({ poruka: "Zahtjev uspješno ažuriran" });
  } catch (error) {
    console.error("Error updating zahtjev:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/moja-interesovanja", async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  try {
    const loggedInUser = await db.Korisnik.findOne({
      where: { username: req.session.username },
    });

    if (!loggedInUser) {
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    const upiti = await db.Upit.findAll({
      where: { KorisnikId: loggedInUser.id },
      include: [db.Nekretnina],
      attributes: ["id", "NekretninaId", "tekst"],
    });

    const zahtjevi = await db.Zahtjev.findAll({
      where: { KorisnikId: loggedInUser.id },
      include: [db.Nekretnina],
      attributes: ["id", "NekretninaId", "tekst", "trazeniDatum", "odobren"],
    });

    const ponude = await db.Ponuda.findAll({
      where: { KorisnikId: loggedInUser.id },
      include: [db.Nekretnina],
      attributes: [
        "id",
        "NekretninaId",
        "tekst",
        "cijenaPonude",
        "odbijenaPonuda",
      ],
    });

    const formattedInteresovanja = [
      ...upiti.map((upit) => ({
        type: "upit",
        id_nekretnine: upit.NekretninaId,
        tekst: upit.tekst,
      })),
      ...zahtjevi.map((zahtjev) => ({
        type: "zahtjev",
        id_nekretnine: zahtjev.NekretninaId,
        tekst: zahtjev.tekst,
        trazeniDatum: zahtjev.trazeniDatum,
        odobren: zahtjev.odobren,
      })),
      ...ponude.map((ponuda) => ({
        type: "ponuda",
        id_nekretnine: ponuda.NekretninaId,
        tekst: ponuda.tekst,
        odbijenaPonuda: ponuda.odbijenaPonuda,
      })),
    ];

    res.json(formattedInteresovanja);
  } catch (error) {
    console.error("Error fetching interesovanja:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/nekretnine/slike/header", async (req, res) => {
  try {
    const headerImages = await db.Slike.findAll({
      where: { type: "header" },
      include: [{
        model: db.Nekretnina,
        attributes: ['id', 'naziv']
      }]
    });

    if (!headerImages || headerImages.length === 0) {
      return res.status(404).json({ greska: "Nisu pronađene header slike" });
    }

    const formattedImages = headerImages.map(image => ({
      id: image.id,
      path: image.path,
      nekretnina_id: image.Nekretnina.id,
      nekretnina_naziv: image.Nekretnina.naziv
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error("Error fetching header images:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/nekretnine/slike/gallery", async (req, res) => {
  try {
    const galleryImages = await db.Slike.findAll({
      where: { type: "gallery" },
      include: [{
        model: db.Nekretnina,
        attributes: ['id', 'naziv']
      }]
    });

    if (!galleryImages || galleryImages.length === 0) {
      return res.status(404).json({ greska: "Nisu pronađene gallery slike" });
    }

    const formattedImages = galleryImages.map(image => ({
      id: image.id,
      path: image.path,
      nekretnina_id: image.Nekretnina.id,
      nekretnina_naziv: image.Nekretnina.naziv
    }));

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/nekretnina/:id/slike", async (req, res) => {
  try {
    const nekretninaId = parseInt(req.params.id);
    
    const nekretnina = await db.Nekretnina.findByPk(nekretninaId);
    if (!nekretnina) {
      return res.status(404).json({ 
        greska: `Nekretnina sa ID ${nekretninaId} nije pronađena` 
      });
    }

    const images = await db.Slike.findAll({
      where: { NekretninaId: nekretninaId },
      order: [
        ['type', 'ASC'], 
        ['id', 'ASC']
      ]
    });

    if (!images || images.length === 0) {
      return res.status(404).json({ 
        greska: `Nisu pronađene slike za nekretninu sa ID ${nekretninaId}` 
      });
    }

    const formattedImages = {
      nekretnina_id: nekretninaId,
      nekretnina_naziv: nekretnina.naziv,
      header: images.filter(img => img.type === 'header')
        .map(img => ({ id: img.id, path: img.path })),
      gallery: images.filter(img => img.type === 'gallery')
        .map(img => ({ id: img.id, path: img.path }))
    };

    res.status(200).json(formattedImages);
  } catch (error) {
    console.error("Error fetching images for nekretnina:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/vijesti", async (req, res) => {
  try {
    const vijesti = await db.Vijest.findAll({
      order: [["datum", "DESC"]],
    });
    res.json(vijesti);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/vijest/:id", async (req, res) => {
  try {
    const vijest = await db.Vijest.findByPk(req.params.id);
    if (!vijest) {
      return res.status(404).json({ greska: "Vijest nije pronađena" });
    }
    res.json(vijest);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/vijesti/istaknuta", async (req, res) => {
  try {
    const istaknuta = await db.Vijest.findOne({
      where: { istaknutaVijest: true },
      order: [["datum", "DESC"]],
    });
    res.json(istaknuta);
  } catch (error) {
    console.error("Error fetching featured news:", error);
    res.status(500).json({ greska: "Internal Server Error" });
  }
});

app.get("/statistika/nekretnine/periodi", async (req, res) => {
  try {
    const nekretnine = await db.Nekretnina.findAll({
      attributes: ["datum_objave", "cijena"],
    });
    res.json(nekretnine);
  } catch (error) {
    res.status(500).json({ greska: "Error fetching period data" });
  }
});

app.get("/statistika/nekretnine/average", async (req, res) => {
  const {
    tip_nekretnine,
    min_kvadratura,
    max_kvadratura,
    min_cijena,
    max_cijena,
  } = req.query;

  try {
    const uslov = {};
    if (tip_nekretnine) uslov.tip_nekretnine = tip_nekretnine;
    if (min_kvadratura) uslov.kvadratura = { [Op.gte]: min_kvadratura };
    if (max_kvadratura) uslov.kvadratura = { [Op.lte]: max_kvadratura };
    if (min_cijena) uslov.cijena = { [Op.gte]: min_cijena };
    if (max_cijena) uslov.cijena = { [Op.lte]: max_cijena };

    const nekretnine = await db.Nekretnina.findAll({ where: uslov });

    const avgKvadratura =
      nekretnine.reduce((sum, n) => sum + n.kvadratura, 0) / nekretnine.length;

    res.json({ prosjecnaKvadratura: avgKvadratura });
  } catch (error) {
    res.status(500).json({ greska: "Error calculating average" });
  }
});

app.get("/statistika/nekretnine/outlier", async (req, res) => {
  const {
    tip_nekretnine,
    min_kvadratura,
    max_kvadratura,
    min_cijena,
    max_cijena,
    svojstvo,
  } = req.query;

  try {
    const uslov = {};
    if (tip_nekretnine) uslov.tip_nekretnine = tip_nekretnine;
    if (min_kvadratura) uslov.kvadratura = { [Op.gte]: min_kvadratura };
    if (max_kvadratura) uslov.kvadratura = { [Op.lte]: max_kvadratura };
    if (min_cijena) uslov.cijena = { [Op.gte]: min_cijena };
    if (max_cijena) uslov.cijena = { [Op.lte]: max_cijena };

    const nekretnine = await db.Nekretnina.findAll({ where: uslov });

    const avg =
      nekretnine.reduce((sum, n) => sum + n[svojstvo], 0) / nekretnine.length;

    let maxDiff = -Infinity;
    let outlier = null;

    nekretnine.forEach((n) => {
      const diff = Math.abs(n[svojstvo] - avg);
      if (diff > maxDiff) {
        maxDiff = diff;
        outlier = n;
      }
    });

    res.json(outlier);
  } catch (error) {
    res.status(500).json({ greska: "Error finding outlier" });
  }
});

const initializeApp = async () => {
  try {
    await db.sequelize.sync({ force: true });
    await dataMigration();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  }
};

initializeApp();
