const env = require('../config/env');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UsuarioServico{
    constructor(UsuarioModel){
        this.usuario = UsuarioModel;
    };

    async mostrarUsua(){  
        const usuarios = await this.usuario.findAll();
        try{
            return usuarios;
        }catch{
            console.error(erro.mensage);
            throw erro
        }
    };

    async cadastrarUsua(usuarioDTO){
        try{
        const email= await this.usuario.findOne({
            where: {
                email: usuarioDTO.email
            }
        })
        if (email != null){
            throw new Error('Esse email já está cadastrado!')
        }
            const salt = parseInt( env.salt )
            usuarioDTO.senha = bcrypt.hashSync(usuarioDTO.senha,salt)
            await this.usuario.create(usuarioDTO);
        } catch (erro) {
            console.error(erro.message)
            throw erro
            }
    };

    geraToken(usuario) {
        const token = jwt.sign({id:usuario.id_usua}, env.jwtSecret, {expiresIn: env.jwtTime})
        return token;
    }

    async login(email, senha){
        const usuario = await  this.usuario.findOne({
            where:{
                email:email
            }
        })

        if (usuario === null) {
            throw new Error('Email incorreto');
        }

        const senhainvalida = bcrypt.compareSync(senha, usuario.senha);

        if (!senhainvalida) {
            throw new Error('Senha incorreta');
        }  
        
        const token = this.geraToken(usuario);
        return { token }
        
    }

    async atualizarUsuario(id_usua, dadosAtualizados) {
        const usuario = await this.usuario.findByPk(id_usua);

        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        // Atualiza somente os campos enviados
        Object.keys(dadosAtualizados).forEach(chave => {
            usuario[chave] = dadosAtualizados[chave];
        });

        await usuario.save();
    }

    async buscarPorId(id) {
        return await this.usuario.findByPk(id, {
            attributes: ['nome_usua', 'email', 'telefone', 'foto']
        });
    }
    
    async atualizarUsuario(id_usua, dadosAtualizados) {
        const usuario = await this.usuario.findByPk(id_usua);
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        Object.keys(dadosAtualizados).forEach(chave => {
            usuario[chave] = dadosAtualizados[chave];
        });

        await usuario.save();
    }

    async buscarPorEmail(email) {
        return await this.usuario.findOne({ where: { email:email } });
    }

// No arquivo anuncio.js (serviço)

    async atualizarImagem(req, id_anuncio) {
    try {
        // Buscar o anúncio no banco de dados
        const anuncioAtualizar = await this.anuncio.findByPk(id_anuncio);

        if (!anuncioAtualizar) {
        throw new Error("Anúncio não encontrado");
        }

        // Obter o arquivo enviado
        const file = req.file;

        if (!file) {
        throw new Error("Nenhum arquivo foi enviado");
        }

        // Upload da imagem para Cloudinary
        const resultadoUpload = await cloudinary.uploader.upload(file.path, {
        folder: 'easy/anuncios'
        });

        // Atualizar o campo foto_produto com o novo URL da imagem
        await anuncioAtualizar.update({
        foto_produto: resultadoUpload.secure_url
        });

        // Remover o arquivo temporário do sistema de arquivos
        fs.unlinkSync(file.path);

        return resultadoUpload.secure_url;
    } catch (error) {
        console.error('Erro em atualizarImagem:', error.message);
        throw error;
    }
    }
}

module.exports = UsuarioServico