const express = require('express');
const rotas = require('./api');
const app = express();
const { sequelize } = require('./models');
const cookieParser = require('cookie-parser');
const verificarToken = require('./middleware/autenticacao')
const cors = require('cors')
const env = require('./config/env');

app.use(cors({
  origin: env.cliente_url,
  credentials: true,
  methods: 'GET, PUT, POST, OPTIONS, DELETE',
}))

app.use(express.json());
app.use(cookieParser());

app.all('/*splat', (req, res, next) => {
  const rotasPublicas = env.rotas_public?.split(',') || [];

  for (const rota of rotasPublicas) {
    if (req.path === rota) {
      return next(); // Permitir acesso a rota pública
    }
  }

  // Se não for pública, validar o token
  verificarToken(req, res, next);
});
/*  */
app.use('/', rotas);

sequelize.sync({ /* force: true */ }).then(() => {
    console.log('Conectado com o banco de dados')
});

app.listen(3000, () =>{
    console.log('Online')
});