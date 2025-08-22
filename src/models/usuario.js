const usuario = (sequelize, DataTypes) => {
    const Usuario = sequelize.define('Usuario',{
        nome_usua:{
            type: DataTypes.STRING
        },
        id_usua:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        }, 
        email:{
            type: DataTypes.STRING,
            unique: true
        },
        senha:{
            type: DataTypes.STRING,
            allowNull: false
        },
        telefone:{
            type: DataTypes.STRING,
            allowNull: false
        },
        foto: {
            type: DataTypes.STRING, // URL da imagem no Cloudinary
            allowNull: true
        } 
    }, {
        createdAt: false,
        updatedAt: false,
        tableName: 'usuario',
    })
    Usuario.associate = function(models) {
        Usuario.hasMany(models.anuncio, {  // <== minúsculo aqui
            foreignKey: 'id_usua',
            as: 'anuncio' 
        });
    }

    return Usuario
};

module.exports = usuario;