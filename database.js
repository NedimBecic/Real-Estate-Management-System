const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("wt24", "root", "password", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
  define: {
    freezeTableName: true,
  },
});

const Korisnik = sequelize.define("Korisnik", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prezime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

const Nekretnina = sequelize.define("Nekretnina", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tip_nekretnine: {
    type: DataTypes.ENUM("Stan", "Kuća", "Poslovni prostor"),
    allowNull: false,
  },
  naziv: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  kvadratura: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  cijena: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  tip_grijanja: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lokacija: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  godina_izgradnje: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  datum_objave: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  opis: {
    type: DataTypes.TEXT,
  },
});

const Upit = sequelize.define("Upit", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tekst: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

const Zahtjev = sequelize.define("Zahtjev", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tekst: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  trazeniDatum: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  odobren: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

const Ponuda = sequelize.define("Ponuda", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tekst: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cijenaPonude: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  datumPonude: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  odbijenaPonuda: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Korisnik.hasMany(Upit);
Upit.belongsTo(Korisnik);

Korisnik.hasMany(Zahtjev);
Zahtjev.belongsTo(Korisnik);

Korisnik.hasMany(Ponuda);
Ponuda.belongsTo(Korisnik);

Nekretnina.hasMany(Upit);
Upit.belongsTo(Nekretnina);

Nekretnina.hasMany(Zahtjev);
Zahtjev.belongsTo(Nekretnina);

Nekretnina.hasMany(Ponuda);
Ponuda.belongsTo(Nekretnina);

Ponuda.belongsTo(Ponuda, { as: "vezanaPonuda", foreignKey: "vezanaPonudaId" });
Ponuda.hasMany(Ponuda, { as: "vezanePonude", foreignKey: "vezanaPonudaId" });

Nekretnina.prototype.getInteresovanja = async function () {
  const [upiti, zahtjevi, ponude] = await Promise.all([
    Upit.findAll({
      where: { nekretninaId: this.id },
      include: [Korisnik],
    }),
    Zahtjev.findAll({
      where: { nekretninaId: this.id },
      include: [Korisnik],
    }),
    Ponuda.findAll({
      where: { nekretninaId: this.id },
      include: [Korisnik, "vezanePonude"],
    }),
  ]);

  return [...upiti, ...zahtjevi, ...ponude];
};

const initDatabase = async () => {
  await sequelize.sync({ force: true });

  await Korisnik.create({
    ime: "Admin",
    prezime: "Admin",
    username: "admin",
    password: "admin",
    admin: true,
  });

  await Korisnik.create({
    ime: "User",
    prezime: "User",
    username: "user",
    password: "user",
    admin: false,
  });
};

module.exports = {
  sequelize,
  Korisnik,
  Nekretnina,
  Upit,
  Zahtjev,
  Ponuda,
  initDatabase,
};


