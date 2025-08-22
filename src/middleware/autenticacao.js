const jwt = require('jsonwebtoken');
const env = require('../config/env');

function verificarToken(req, res, next){
    const token = req.cookies ? req.cookies.token : null

    if (!token){
        return res.status(403).send({
            auth: false, message:'Nenhum token fornecido.'
        })
    }

    jwt.verify(token, env.jwtSecret,(err,decoded) =>{
            if(err){
                return res.status(403).send({
                    auth: false,
                    message:'Falha na autenticação. Error ->' + err
                })
            }
            req.id_usua = decoded.id
            next()
    })
}

module.exports = verificarToken