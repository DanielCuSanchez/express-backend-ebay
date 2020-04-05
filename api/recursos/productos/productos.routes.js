const uuidV4 = require('uuid/v4')
const express = require('express')
const _ = require('underscore')
const passport = require('passport')


const productoController = require('./productos.controller')
const { validarImagenDeProducto, validarDataDeProducto } = require('./productos.validate')
const log = require('../../../utils/logger')
const procesarErrores = require('../../libs/errorHandler').procesarErrores
const { UsuarioNoEsDueño, ProductoNoExiste } = require('./productos.error')
//Autenticacion
const authUser = passport.authenticate('jwt', { session: false })
// const productos = require('./database').productos
const productosRouter = express.Router()
//Middleware
function validarID(req, res, next) {
    let id = req.params.id
    //regex
    if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
        res.status(400).send(`El id [${id}] suministrado en el URL no es valido`)
        return
    }
    next()
}

//Routes
productosRouter.get('/', authUser, procesarErrores((req, res) => {
    return productoController.obtenerProductos()
        .then(productos => {
            res.status(200).json(productos)
        })
}))

productosRouter.get('/:id', validarID, procesarErrores((req, res) => {
    const id = req.params.id
    return productoController.obtenerProductoById(id)
        .then(producto => {
            if (!producto) {
                log.error(`Producto no existe [${id}]`)
                throw new ProductoNoExiste(`Producto no existe [${id}]`)
            }
            else {
                res.status(200).json(producto)
            }
        })

}))

productosRouter.post('/', [authUser, validarDataDeProducto], procesarErrores((req, res) => {

    return productoController.crearProducto(req.body, req.user.username)
        .then(producto => {
            log.info(`[Producto creado exitosamente`, producto.toObject())
            res.status(201).json(producto)
        })

}))

productosRouter.put('/:id', [authUser, validarID, validarDataDeProducto], procesarErrores(async (req, res) => { //Remplazos totales de productos que ya existen

    const id = req.params.id
    const productoDeRemplazo = req.body
    const username = req.user.username
    let productoReemplazar


    productoReemplazar = await productoController.obtenerProductoById(id)


    if (!productoReemplazar) {
        throw new ProductoNoExiste(`Producto no existe [${id}]`)
    }

    if (productoReemplazar.dueño != username) {
        log.error(`Producto con [${id}] no le pertenece a [${username}] para reemplazar`)
        throw new UsuarioNoEsDueño(`Producto con [${id}] no le pertenece a [${username}] para reemplazar`)
    }

    return productoController.reemplazarProductoById(id, productoDeRemplazo, username)
        .then(producto => {
            log.info(`Producto con ID [${id}] `, producto.toObject())
            res.status(200).json(producto)
        })

}))

productosRouter.put('/:id/imagen', [validarImagenDeProducto], procesarErrores(async (req, res) => {
    log.info(`Received request to upload image for [${req.params.id}]. Size ${req.get('content-length')}`)

    // TODO: Decidir donde guardar la imagen. Disco, S3, MongoDB, memoria, etc

    res.json({ url: "blabla" })
}))

productosRouter.delete('/:id', [authUser, validarID], procesarErrores(async (req, res) => {
    const id = req.params.id
    let productoBorrar = await productoController.obtenerProductoById(id)

    if (!productoBorrar) {
        log.info(`El producto con el [${id}] no existe para eliminar`)
        throw new ProductoNoExiste(`El producto con el [${id}] no existe para eliminar`)
    }
    const usuarioAuth = req.user.username

    if (productoBorrar.dueño != usuarioAuth) {
        log.info(`Usuario [${usuarioAuth}] no es dueño de [${productoBorrar._id}] para eliminar`)
        throw new UsuarioNoEsDueño(`Usuario [${usuarioAuth}] no es dueño de [${productoBorrar._id}] para eliminar`)
    }

    let productoBorrado = await productoController.borrarProductoById(id)

    if (productoBorrado) {
        log.info(`Usuario [${usuarioAuth}] ha borrado [${productoBorrar._id}]`)
        res.status(201).send(`Usuario [${usuarioAuth}] ha borrado [${productoBorrar._id}]`)
        res.json(productoBorrado)
        return
    }
}))

module.exports = productosRouter
