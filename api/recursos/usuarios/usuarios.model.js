const mongoose = require('mongoose')
const Schema = mongoose.Schema
const usuariosSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: [true, 'Debes tener un usuario']
    },
    password: {
        type: String,
        minlength: [8, 'Debe tener minimo 8 caracteres'],
        required: [true, 'Debes tener un password']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Debes tener un correo']
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('usuarios', usuariosSchema)