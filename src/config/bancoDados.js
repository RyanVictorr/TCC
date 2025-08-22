const EnvVariaveis = require('./env');  // Carrega as variáveis do .env

module.exports = {
    username: EnvVariaveis.bd_usua,
    database: EnvVariaveis.bd_nome,
    password: EnvVariaveis.bd_senha,
    host: EnvVariaveis.bd_host,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false 
        }
    },
    logging: false
};

