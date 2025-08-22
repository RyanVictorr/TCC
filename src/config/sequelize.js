const Sequelize = require('sequelize');
const configBancoDados = require('./bancoDados')

const sequelize = new Sequelize(configBancoDados);

module.exports = sequelize