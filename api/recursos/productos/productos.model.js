const mongoose = require('mongoose')

const productosSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'Producto debe tener un titulo']
    },
    precio: {
        type: Number,
        min: 0,
        required: [true, 'Producto debe tener un precio']
    },
    moneda: {
        type: String,
        maxlength: 3,
        minlength: 3,
        required: [true, 'Producto debe tener una moneda']
    },
    dueño: {
        type: String,
        required: [true, 'El producto debe tener un dueño']
    },
    imagen: {
        type: String
    }
})

module.exports = mongoose.model('productos', productosSchema)