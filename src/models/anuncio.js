const anuncio =(sequelize, DataTypes) =>{
    const Anuncio = sequelize.define('Anuncio',{
        nome_anunc:{
            type: DataTypes.STRING
        },
        id_anuncio:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        valor: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        contato_vende:{
            type:DataTypes.STRING,
            allowNull: false
        },
        kilogramas:{
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        }, 
        descricao:{
            type:DataTypes.STRING
        },
        foto_produto:{
            type:DataTypes.TEXT
        },
        id_usua:{
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nome_tipo:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        fotos_anuncio:{
            type: DataTypes.STRING, 
            allowNull: true
        }
    },{
        updatedAt: false,
        tableName: 'anuncio',
    })

    Anuncio.associate = function(models) {
        Anuncio.belongsTo(models.usuario, {  // <== minúsculo aqui
            foreignKey: 'id_usua',
            as: 'usuario'
        });
    }; 
    return Anuncio;
}

module.exports = anuncio;