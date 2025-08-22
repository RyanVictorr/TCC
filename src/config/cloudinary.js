const cloudinary = require('cloudinary').v2;
const cloudConfig = require('./bancoDadosImage');

cloudinary.config(cloudConfig);

module.exports = cloudinary;
