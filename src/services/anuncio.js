const { Op } = require('sequelize');
const upload = require('../middleware/uploadConfig'); // multer config
const cloudinary = require("../config/cloudinary"); // cloudinary config
const fs = require('fs');

class AnuncioServico{
    constructor(AnuncioModel, UsuarioModel){
        this.anuncio = AnuncioModel
        this.usuario = UsuarioModel;
    }

    async mostrarAnunc(){
        const anuncios = await this.anuncio.findAll()
        try{
            return anuncios;
        }catch(erro){
            console.error(erro.message);
            throw erro
        }
    }

    async cadastrarAnunc(anuncioDTO){
        try{
            await this.anuncio.create(anuncioDTO);
        }catch (erro){
            console.error(erro.mensage)
            throw erro
        }
    }

    async buscarAnunc(req){
        try{
            const id_usua = req.id_usua
            const anuncio = await this.anuncio.findAll({
                where:{
                    id_usua: id_usua
                }
            })
        return anuncio
        }catch(erro){
            console.error(erro.message)
            throw erro
        }
    }

    async deletar(req, id) {
        try {
            const id_usua = req.id_usua
            const anuncioEncontrado = await this.anuncio.findOne({
                where: {
                    id_usua: id_usua,
                    id_anuncio: id
                }
            })
            if (!anuncioEncontrado) {
                throw new Error("Anúncio não encontrado.");
            }

            await anuncioEncontrado.destroy();
        }catch (error) {
            throw new Error(error.message || "Não foi possível excluir, tente novamente!");
        }
    }

    async buscarAnunc(req) {
        try {
            const id_usua = req.id_usua;
            const anuncio = await this.anuncio.findAll({
                where: { id_usua },
                include: [
                    {
                        model: this.usuario,
                        as: 'usuario',
                        attributes: ['nome_usua', 'email']
                    }
                ]
            });
            return anuncio;
        } catch (erro) {
            console.error('Erro em buscarAnunc:', erro.message);
            throw erro;
        }
    }

    async atualizarAnuncio(id_anuncio, dadosAtualizados) {
        try {
            const anuncio = await this.anuncio.findByPk(id_anuncio);
            if (!anuncio) {
                throw new Error('Anúncio não encontrado');
            }
            await anuncio.update(dadosAtualizados);
        } catch (erro) {
            console.error('Erro em atualizarAnuncio:', erro.message);
            throw erro;
        }
    }

    async deletar(req, id) {
        try {
            const id_usua = req.id_usua;
            const anuncioEncontrado = await this.anuncio.findOne({
                where: { id_usua, id_anuncio: id }
            });
            if (!anuncioEncontrado) {
                throw new Error('Anúncio não encontrado.');
            }
            await anuncioEncontrado.destroy();
        } catch (erro) {
            console.error('Erro em deletar:', erro.message);
            throw erro;
        }
    }

    async buscarComFiltros(filtros) {
        try{
            // console.log(filtros)
            const filtrosAnuncio = {}

            if (filtros.nome_tipo){
                filtrosAnuncio.nome_tipo = filtros.nome_tipo
            }

            if (filtros.valor_min || filtros.valor_max) {
                filtrosAnuncio.valor = {};
                if (filtros.valor_min){
                    filtrosAnuncio.valor[Op.gte] = filtros.valor_min;
                }
                if (filtros.valor_max){
                    filtrosAnuncio.valor[Op.lte] = filtros.valor_max;
                }
            }


            if (filtros.kg_min || filtros.kg_max) {
                filtrosAnuncio.kilogramas = {};
                if (filtros.kg_min) {
                    filtrosAnuncio.kilogramas[Op.gte] = filtros.kg_min; // >= kg_min
                }
                if (filtros.kg_max) {
                    filtrosAnuncio.kilogramas[Op.lte] = filtros.kg_max; // <= kg_max
                }
            }

            // console.log("condições:", filtrosAnuncio );
            const anuncios = await this.anuncio.findAll({
                where:filtrosAnuncio,
                include: [{
                    model: this.usuario,
                    as: 'usuario',        // deve ser o mesmo alias da associação
                    attributes: ['nome_usua', 'telefone']
                }]
            })
            return anuncios;
        }catch(erro){
            console.error(erro.message);
            throw erro
        }
    }

    async listarAnunciosFeed({ pagina = 1, limite = 20 }) {
        try {
            const offset = (pagina - 1) * limite;

            const anuncios = await this.anuncio.findAll({
                limit: limite,
                offset: offset,
                order: [['createdAt', 'DESC']],
                include: [{
                    model: this.usuario,
                    as: 'usuario', // deve coincidir com o alias da associação
                    attributes: ['nome_usua', 'telefone']
                }]
            });

            return anuncios;

        } catch (erro) {
            console.error('Erro no listarAnunciosFeed:', erro.message);
            throw erro;
        }
    }

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


    async atualizarAnuncio(id_anuncio, dadosAtualizados) {
    try {
        const anuncio = await this.anuncio.findByPk(id_anuncio);
        
        if (!anuncio) {
        throw new Error("Anúncio não encontrado");
        }

        // Atualizar apenas os campos que foram enviados
        const camposParaAtualizar = Object.keys(dadosAtualizados).filter(campo => 
        campo !== 'id_anuncio' && campo !== 'foto_produto'
        );

        for (const campo of camposParaAtualizar) {
        anuncio[campo] = dadosAtualizados[campo];
        }

        await anuncio.save();

        return anuncio;
    } catch (error) {
        console.error('Erro ao atualizar anúncio:', error.message);
        throw error;
    }
    }
}

module.exports = AnuncioServico