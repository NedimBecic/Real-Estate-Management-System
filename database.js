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

const Slike = sequelize.define("Slike", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("header", "gallery"),
    allowNull: false,
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
    allowNull: true,
    defaultValue: null,
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
    allowNull: true,
    defaultValue: null,
  },
  vezanaPonudaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Ponuda",
      key: "id",
    },
  },
});

const Vijest = sequelize.define("Vijest", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  naslov: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tekst: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  slika: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  datum: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  kategorija: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  istaknutaVijest: {
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

Nekretnina.hasMany(Slike);
Slike.belongsTo(Nekretnina);

Ponuda.belongsTo(Ponuda, { as: "vezanaPonuda", foreignKey: "vezanaPonudaId" });
Ponuda.hasMany(Ponuda, { as: "vezanePonude", foreignKey: "vezanaPonudaId" });

const initDatabase = async () => {
  await sequelize.sync({ force: true });

};

module.exports = {
  sequelize,
  Korisnik,
  Nekretnina,
  Upit,
  Zahtjev,
  Ponuda,
  Slike,
  Vijest,
  initDatabase,
};
