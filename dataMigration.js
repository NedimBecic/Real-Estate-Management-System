const path = require("path");
const fs = require("fs").promises;
const bcrypt = require("bcrypt");
const db = require("./database.js");

async function dataMigration() {
  try {
    await db.sequelize.sync({ force: true });

    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    const korisnici = JSON.parse(
      await fs.readFile(path.join(__dirname, "data", "korisnici.json"), "utf-8")
    );
    const nekretnine = JSON.parse(
      await fs.readFile(
        path.join(__dirname, "data", "nekretnine.json"),
        "utf-8"
      )
    );
    const vijesti = JSON.parse(
      await fs.readFile(path.join(__dirname, "data", "vijesti.json"), "utf-8")
    );

    await db.Upit.destroy({ where: {} });
    await db.Nekretnina.destroy({ where: {} });
    await db.Korisnik.destroy({ where: {} });
    await db.Vijest.destroy({ where: {} });

    for (const korisnik of korisnici) {
      await db.Korisnik.create({
        ime: korisnik.ime,
        prezime: korisnik.prezime,
        username: korisnik.username,
        password: korisnik.password,
        admin: false,
      });
    }

    await db.Korisnik.create({
      ime: "Admin",
      prezime: "Admin",
      username: "admin",
      password: await bcrypt.hash("admin", 10),
      admin: true,
    });

    await db.Korisnik.create({
      ime: "User",
      prezime: "User",
      username: "user",
      password: await bcrypt.hash("user", 10),
      admin: false,
    });

    for (const nekretnina of nekretnine) {
      const createdNekretnina = await db.Nekretnina.create({
        tip_nekretnine: nekretnina.tip_nekretnine,
        naziv: nekretnina.naziv,
        kvadratura: nekretnina.kvadratura,
        cijena: nekretnina.cijena,
        tip_grijanja: nekretnina.tip_grijanja,
        lokacija: nekretnina.lokacija,
        godina_izgradnje: nekretnina.godina_izgradnje,
        datum_objave: new Date(
          nekretnina.datum_objave.split(".").reverse().join("-")
        ),
        opis: nekretnina.opis,
      });

      for (const upit of nekretnina.upiti) {
        const user = await db.Korisnik.findOne({
          where: { id: upit.korisnik_id },
        });

        if (user) {
          await db.Upit.create({
            tekst: upit.tekst_upita,
            KorisnikId: user.id,
            NekretninaId: createdNekretnina.id,
          });
        }
      }
    }

    for (const vijest of vijesti) {
      await db.Vijest.create({
        naslov: vijest.naslov,
        tekst: vijest.tekst,
        slika: vijest.slika,
        kategorija: vijest.kategorija,
        istaknutaVijest: vijest.istaknutaVijest || false,
        datum: new Date(),
      });
    }

    await db.Slike.bulkCreate([
      {
        path: "../Resources/nekretnine/s-1.jpg",
        type: "header",
        NekretninaId: 1,
      },
      {
        path: "../Resources/nekretnine/s-2.jpg",
        type: "header",
        NekretninaId: 2,
      },
      {
        path: "../Resources/nekretnine/s-3.jpg",
        type: "header",
        NekretninaId: 3,
      },
      {
        path: "../Resources/nekretnine/k-1.jpg",
        type: "header",
        NekretninaId: 4,
      },
      {
        path: "../Resources/nekretnine/k-2.jpg",
        type: "header",
        NekretninaId: 5,
      },
      {
        path: "../Resources/nekretnine/k-3.jpg",
        type: "header",
        NekretninaId: 6,
      },
      {
        path: "../Resources/nekretnine/pp-1.jpg",
        type: "header",
        NekretninaId: 7,
      },
      {
        path: "../Resources/nekretnine/pp-2.jpg",
        type: "header",
        NekretninaId: 8,
      },
      {
        path: "../Resources/nekretnine/pp-3.jpg",
        type: "header",
        NekretninaId: 9,
      },
    ]);

    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Data migration completed successfully!");
  } catch (error) {
    console.error("Error during data migration:", error);
    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  }
}

module.exports = { dataMigration };
