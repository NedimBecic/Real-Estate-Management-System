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

const upitAttempts = {};

app.use(
  session({
    secret: "tajna sifra",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.static(__dirname + "/public"));

// Enable JSON parsing without body-parser
app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("/prijava.html");
});

/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
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

// Array of HTML files and their routes
const routes = [
  { route: "/nekretnine.html", file: "nekretnine.html" },
  { route: "/detalji.html", file: "detalji.html" },
  { route: "/meni.html", file: "meni.html" },
  { route: "/prijava.html", file: "prijava.html" },
  { route: "/profil.html", file: "profil.html" },
  { route: "/statistika.html", file: "statistika.html" },
  { route: "/vijesti.html", file: "vijesti.html" },
  { route: "/mojiUpiti.html", file: "mojiUpiti.html" },
  { route: "/odajava.html", file: "odjava.html" },
  // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, "data", `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, "utf-8");
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, "data", `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    throw error;
  }
}

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

/*
Checks if the user exists and if the password is correct based on korisnici.json data. 
If the data is correct, the username is saved in the session and a success message is sent.
*/

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

/*
Delete everything from the session.
*/
app.post("/logout", (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  // Clear all information from the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      res.status(500).json({ greska: "Internal Server Error" });
    } else {
      res.status(200).json({ poruka: "Uspješno ste se odjavili" });
    }
  });
});

/*
Returns currently logged user data. First takes the username from the session and grabs other data
from the .json file.
*/
app.get("/korisnik", async (req, res) => {
  // Check if the username is present in the session
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: "Neautorizovan pristup" });
  }

  // User is logged in, fetch additional user data
  const username = req.session.username;

  try {
    // Read user data from the JSON file
    const user = await db.Korisnik.findOne({
      where: { username: username },
    });

    if (!user) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: "Neautorizovan pristup" });
    }

    // Send user data
    const userData = {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      password: user.password, // Should exclude the password for security reasons
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
    // User is not logged in
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

/*
Updates any user field
*/
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

/*
Returns all properties from the file.
*/
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

/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post("/marketing/nekretnine", async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile("preferencije");

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error("Neispravan format podataka u preferencije.json.");
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile("preferencije", preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/marketing/nekretnina/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON
    const preferencije = await readJsonFile("preferencije");

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find(
      (item) => item.id === parseInt(id, 10)
    );

    if (nekretninaData) {
      // Update clicks
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile("preferencije", preferencije);

      res
        .status(200)
        .json({ success: true, message: "Broj klikova ažuriran." });
    } else {
      res.status(404).json({ error: "Nekretnina nije pronađena." });
    }
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/marketing/osvjezi/pretrage", async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON
    const preferencije = await readJsonFile("preferencije");

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/marketing/osvjezi/klikovi", async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON
    const preferencije = await readJsonFile("preferencije");

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error("Greška prilikom čitanja ili pisanja JSON datoteke:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
