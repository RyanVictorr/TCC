const sequelize = require('../config/sequelize');
const Sequelize = require('sequelize')
const Usuario = require('./usuario');
const Anuncio = require('./anuncio');

const usuario = Usuario(sequelize, Sequelize.DataTypes)
const anuncio = Anuncio(sequelize, Sequelize.DataTypes)


const bd = {
    usuario,
    anuncio,
    sequelize
}

Object.values(bd).forEach(model => {
  if (model.associate) {
    model.associate(bd);
  }
});

module.exports = bd;