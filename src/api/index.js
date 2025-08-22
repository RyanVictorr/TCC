const express = require('express');
const usuarioRota = require('./usuario')
const anuncioRota = require('./anuncio')
const rota = express.Router();

rota.get('/', (req, res)=>{
    res.send('Online')
});

rota.use('/usuario', usuarioRota);
rota.use('/anuncio', anuncioRota);

module.exports = rota;