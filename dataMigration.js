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

    await db.Upit.destroy({ where: {} });
    await db.Nekretnina.destroy({ where: {} });
    await db.Korisnik.destroy({ where: {} });

    for (const korisnik of korisnici) {
      await db.Korisnik.create({
        ime: korisnik.ime,
        prezime: korisnik.prezime,
        username: korisnik.username,
        password: korisnik.password, 
        admin: false,
      });
    }

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

    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Data migration completed successfully!");
  } catch (error) {
    console.error("Error during data migration:", error);
    await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  }
}

module.exports = { dataMigration };
