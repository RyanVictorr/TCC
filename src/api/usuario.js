const express = require('express');
const rota = express.Router();
const { usuario } = require('../models');
const UsuarioServico = require('../services/usuario')
const { body, validationResult, check} = require('express-validator')
const env = require('../config/env'); 
const upload = require('../middleware/uploadConfig'); // multer config
const cloudinary = require("../config/cloudinary"); // cloudinary config
const fs = require('fs');

const usuarioServico = new UsuarioServico(usuario)

rota.get('/usuariosMostrar', async (req, res) => {
    const usuarios = await usuarioServico.mostrarUsua()
    res.status(200).json(usuarios);
});

rota.post('/cadastrar',
    upload.single('foto'), 
    body('nome_usua').not().isEmpty().trim().escape(),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    check('senha').isLength({min:8}).withMessage('Essa senha deve ter pelo menos 8 caracteres'),
    async (req, res) => {
        const erros = validationResult(req)
        if (!erros.isEmpty()){
            return res.status(400).json({erros: erros.array()})
        }
        const { nome_usua, email, senha, telefone } = req.body;
        try{
            let urlImagem = null;
            
            if (req.file) {
                const resultado = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'easymeat/usuarios'
                });
                urlImagem = resultado.secure_url;
                fs.unlinkSync(req.file.path); 
            }   

            await usuarioServico.cadastrarUsua({nome_usua, email, senha, telefone, foto: urlImagem})
            res.status(201).send('Add');
        }catch (error) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ erros: [{ msg: error.message }] });
        }
    }
);

rota.post('/login', async(req, res)=>{
    try {
        const { email, senha } = req.body;

        const { token } = await usuarioServico.login(email, senha);
        const isProduction = env.node_env === 'production';
        return res.cookie('token', token,{
            httpOnly: true, sameSite: isProduction ? 'None' : 'Lax',
            maxAge: 120
        }).status(200).json({ auth: true, Token:token, message: 'Login bem sucedido!' });

    } catch (error) {
        res.status(401).json({ error: error.message });;
    }
})


rota.put(
    '/atualizarUsuario', 
    upload.single('foto'), 
    [
        body('dadosAtualizados.nome_usua')
            .optional()
            .trim()
            .isLength({ min: 3 })
            .withMessage('Nome muito curto'),
        body('dadosAtualizados.email')
            .optional()
            .isEmail()
            .withMessage('Email inválido')
            .normalizeEmail(),
        body('dadosAtualizados.telefone')
            .optional()
            .matches(/^\d{10,11}$/)
            .withMessage('Telefone inválido'),
    ],
    async (req, res) => {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ erros: erros.array() });
        }

        try {
            // const id_usua = req.id_usua; // Vem do middleware de autenticação

            //temporario
            const id_usua = 1
            let dadosAtualizados = req.body.dadosAtualizados;
            if (typeof dadosAtualizados === "string") {
                dadosAtualizados = JSON.parse(dadosAtualizados);
            }

            // Checagem de email duplicado
            if (dadosAtualizados.email) {
                const existente = await usuarioServico.buscarPorEmail(dadosAtualizados.email);
                if (existente && existente.id_usua !== id_usua) {
                    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                    return res.status(400).json({ erros: [{ msg: 'Email já está em uso' }] });
                }
            }

            // Validação e upload de foto
            if (req.file) {
                const tiposPermitidos = ['image/jpeg', 'image/png'];
                if (!tiposPermitidos.includes(req.file.mimetype)) {
                    fs.unlinkSync(req.file.path);
                    return res.status(400).json({ erros: [{ msg: 'Formato de imagem inválido' }] });
                }
                if (req.file.size > 2 * 1024 * 1024) { // 2MB
                    fs.unlinkSync(req.file.path);
                    return res.status(400).json({ erros: [{ msg: 'Imagem muito grande' }] });
                }

                const resultado = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'easymeat/usuarios'
                });
                dadosAtualizados.foto = resultado.secure_url;
                fs.unlinkSync(req.file.path);
            }

            // Atualiza o usuário
            await usuarioServico.atualizarUsuario(id_usua, dadosAtualizados);

            res.status(200).json('Dados do usuário atualizados com sucesso.');
        } catch (erro) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            res.status(400).json('Erro ao atualizar usuário: ' + erro.message);
        }
    }
);

rota.get('/infoPerfil', async (req, res) =>{    
    try {
        const usuarioId = req.id_usua; 
        const usuario = await usuarioServico.buscarPorId(usuarioId);

        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' });
        }

        res.status(200).json({
            nome: usuario.nome_usua,
            email: usuario.email,
            telefone: usuario.telefone,
            foto: usuario.foto
        });
    } catch (error) {
        res.status(500).json({ mensagem: error.message });
    }
})



module.exports = rota;