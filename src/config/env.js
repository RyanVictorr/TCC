const dotenv = require('dotenv')

dotenv.config()

module.exports={
    bd_host:process.env.bd_host,
    bd_nome:process.env.bd_nome,
    bd_usua:process.env.bd_usua,
    bd_senha:process.env.bd_senha,
    //bcript
    salt:process.env.salt,
    jwtSecret: process.env.jwtSecret,
    jwtTime: process.env.jwtTime,
    cliente_url: process.env.cliente_url,
    rotas_public: process.env.rotas_public,

    //cloudinary
    cloud_name:process.env.nomeCloud,
    cloud_key:process.env.chaveApi,
    cloud_secret:process.env.secretaApi,
}