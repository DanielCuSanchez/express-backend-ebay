const uuidV4 = require('uuid/v4')
const express = require('express')
const _ = require('underscore')
const passport = require('passport')


const productoController = require('./productos.controller')
const { validarProducto } = require('./productos.validate')
const log = require('../../../utils/logger')
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
productosRouter.get('/', authUser, (req, res) => {
    productoController.obtenerProductos()
        .then(productos => {
            res.status(200).json(productos)
        })
        .catch(error => {
            res.status(500).send('Error al leer los productos del usuario')
        })
})
productosRouter.post('/', [authUser, validarProducto], (req, res) => {

    productoController.crearProducto(req.body, req.user.username)
        .then(producto => {
            log.info(`[Producto creado exitosamente`, producto.toObject())
            res.status(201).json(producto)
        })
        .catch(error => {
            log.error(`[${JSON.stringify(error)} No se pudo crear el producto]`)
            res.status(500).send(`Error al crear el producto`)
        })

})

productosRouter.get('/:id', validarID, (req, res) => {
    const id = req.params.id
    productoController.obtenerProductoById(id)
        .then(producto => {
            if (!producto) {
                res.status(404).send(`No se encuentra el producto con el id [${id}]`)
            }
            else {
                res.status(200).json(producto)
            }
        })
        .catch(error => {
            log.error(`Error al obtener producto con ${id} `, error)
            res.sendStatus(500).send(`Error al consultar producto con id [${id}]`)
        })

})
productosRouter.put('/:id', [authUser, validarID, validarProducto], async (req, res) => { //Remplazos totales de productos que ya existen

    const id = req.params.id
    const productoDeRemplazo = req.body
    const username = req.user.username
    let productoReemplazar

    try {
        productoReemplazar = await productoController.obtenerProductoById(id)
    } catch (error) {
        log.error(`Ocurrio un problema buscando producto [${id}] para reemplazar]`, error)
        res.status(500).send(`Ocurrio un problema buscando producto [${id}] para reemplazar]`)
    }

    if (!productoReemplazar) {
        log.error(`Producto con [${id}] no existe`)
        res.status(404).send(`Producto con [${id}] no existe`)
        return
    }

    if (productoReemplazar.dueño != username) {
        log.error(`Producto con [${id}] no le pertenece a [${username}] para reemplazar`)
        res.status(401).send(`Producto con [${id}] no te pertenece`)
        return
    }

    productoController.reemplazarProductoById(id, productoDeRemplazo, username)
        .then(producto => {
            log.info(`Producto con ID [${id}] `, producto.toObject())
            res.status(200).json(producto)
        })
        .catch(e => res.status(500).send(`Ocurrio un error al reemplazar el producto`))

})
productosRouter.delete('/:id', [authUser, validarID], async (req, res) => {
    const id = req.params.id
    let productoBorrar
    try {
        productoBorrar = await productoController.obtenerProductoById(id)
    } catch (error) {
        log.error(`Ocurrió un error al borrar producto con [${id}]`, error)
        res.status(500).send(`Ocurrió un error al borrar producto con [${id}]`)
        return
    }

    if (!productoBorrar) {
        log.info(`El producto con el [${id}] no existe para eliminar`)
        res.status(404).send(`Producto con id [${id}] no existe. Nada que borrar`)
        return
    }
    const usuarioAuth = req.user.username
    if (productoBorrar.dueño != usuarioAuth) {
        log.info(`Usuario [${usuarioAuth}] no es dueño de [${productoBorrar._id}] para eliminar`)
        res.status(401).send(`Usuario [${usuarioAuth}] no es dueño de [${productoBorrar._id}] para eliminar`)
        return
    }

    try {
        let productoBorrado = await productoController.borrarProductoById(id)
    } catch (error) {
        log.error(`Ocurrió un error al borrar producto con [${id}]`, error)
        res.status(500).send(`Ocurrió un error al borrar producto con [${id}]`)
        return
    }

    if (productoBorrado) {
        log.info(`Usuario [${usuarioAuth}] ha borrado [${productoBorrar._id}]`)
        res.status(201).send(`Usuario [${usuarioAuth}] ha borrado [${productoBorrar._id}]`)
        res.json(productoBorrado)
        return
    }
})

module.exports = productosRouter
