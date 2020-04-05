const Producto = require('./productos.model')

function crearProducto(producto, dueño) {
    return new Producto({
        ...producto,
        dueño
    }).save()
}

function obtenerProductos() {
    return Producto.find({})
}

function obtenerProductoById(id) {
    return Producto.findById({ _id: id })
}

function reemplazarProductoById(id, producto, username) {
    return Producto.findOneAndUpdate({ _id: id }, {
        ...producto,
        dueño: username
    }, {
        new: true
    })
}

function borrarProductoById(id) {
    return Producto.findByIdAndRemove(id)
}

function guardarUrlDeImagen(id, imageURL) {
    return Producto.findOneAndUpdate({ _id: id }, {
        imagen: imageURL
    }, {
        new: true
    })
}

module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProductoById,
    reemplazarProductoById,
    borrarProductoById,
    guardarUrlDeImagen
}