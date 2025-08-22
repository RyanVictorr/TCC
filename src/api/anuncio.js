const express = require('express');
const rota = express.Router();
const { anuncio, usuario} = require('../models');
const AnuncioServico = require('../services/anuncio');
const multer = require('multer');
const upload = require('../middleware/uploadConfig');
const fs = require('fs');
const cloudinary = require("../config/cloudinary"); 

const anuncioServico = new AnuncioServico(anuncio, usuario)

rota.get('/mostrarAnuncios', async (req, res) => {
    const anuncios = await anuncioServico.mostrarAnunc()
    res.status(200).json(anuncios)
});

rota.post('/cadastrarAnunc', upload.array('fotos', 3), async (req, res) => {
    try {
        const { nome_anunc, valor, contato_vende, kilogramas, descricao, nome_tipo } = req.body;
        /* const id_usua = req.id_usua; */
        //temporario
        const id_usua = 1
        const urlsFotos = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const resultado = await cloudinary.uploader.upload(file.path, {
                    folder: 'easy/anuncios'
                });
                urlsFotos.push(resultado.secure_url);
                fs.unlinkSync(file.path);
            }
        }

        await anuncioServico.cadastrarAnunc({
            nome_anunc,
            valor,
            contato_vende,
            kilogramas,
            descricao,
            foto_produto: JSON.stringify(urlsFotos),
            nome_tipo,
            id_usua
        });

        res.status(201).json({
            mensagem: 'Anúncio cadastrado com sucesso',
            urls: urlsFotos
        });

    } catch (error) {
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        console.error(error);
        res.status(500).json({
            erro: 'Erro ao cadastrar anúncio',
            detalhe: error.message
        });
    }
});

rota.get('/buscarAnunc', async(req, res ) =>{

    try{
        const anuncio = await anuncioServico.buscarAnunc(req,res)
        res.status(200).json(anuncio)
    }catch(erro){
        res.status(400).json('Erro ao buscar anuncio' + erro.message)
    }
})


rota.delete('/apagar', async (req, res) => {
    const {id_anuncio} = req.body
    try {
        await anuncioServico.deletar(req, id_anuncio)
        res.status(200).json({ message: "Anúncio excluído com sucesso!" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

rota.post('/buscarComFiltro', async (req, res) => {
    try {
        const { filtros } = req.body;
        console.log(filtros) // Aqui você desestrutura corretamente
        const anuncios = await anuncioServico.buscarComFiltros(filtros);
        res.status(200).json(anuncios);
    } catch (erro) {
        res.status(400).json({ mensagem: 'Erro ao buscar anúncios com filtro', detalhes: erro.message });
    }
});

rota.get('/feed', async (req, res) => {
  try {
    const {pagina, limite} = req.body
    
    const paginaInt = Number.isInteger(+pagina) && +pagina > 0 ? +pagina : 1;
    const limiteInt = Number.isInteger(+limite) && +limite > 0 ? +limite : 20;
    
    const anuncios = await anuncioServico.listarAnunciosFeed({ pagina:paginaInt, limite:limiteInt });
    
    // Retorna os anúncios no formato JSON
    res.status(200).json(anuncios);
    
} catch (error) {
    console.error('Erro na rota /anuncios/feed:', error.message);
    res.status(500).json({ mensagem: 'Erro ao listar anúncios' });
}


});

rota.put('/atualizarAnuncio', async (req, res) => {
    try {
        const { id_anuncio } = req.body;
        
    if (!id_anuncio) {
      return res.status(400).json({ mensagem: "ID do anúncio é obrigatório" });
    }
    
    const dadosAtualizados = {};
    Object.keys(req.body).forEach(key => {
        if (key !== 'id_anuncio') {
            dadosAtualizados[key] = req.body[key];
        }
    });
    
    const anuncioAtualizado = await anuncioServico.atualizarAnuncio(id_anuncio, dadosAtualizados);
    
    res.status(200).json({
        mensagem: 'Anúncio atualizado com sucesso',
        dadosAtualizados: anuncioAtualizado
    });
    
} catch (error) {
    console.error('Erro na rota /atualizarAnuncio:', error.message);
    res.status(500).json({ mensagem: 'Erro ao atualizar anúncio' });
}
});

rota.put('/atualizarImagem', upload.single('imagem'), async (req, res) => {
  try {
    const { id_anuncio } = req.body;

    if (!id_anuncio) {
      return res.status(400).json({ mensagem: "ID do anúncio é obrigatório" });
    }

    const novaUrl = await anuncioServico.atualizarImagem(req, id_anuncio);

    res.status(200).json({
      mensagem: 'Imagem atualizada com sucesso',
      novaUrl: novaUrl
    });

  } catch (error) {
    console.error('Erro na rota /atualizarImagem:', error.message);
    res.status(500).json({ mensagem: 'Erro ao atualizar imagem' });
  }
});


module.exports = rota;