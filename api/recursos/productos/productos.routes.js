const express = require('express')
const _ = require('underscore')
const { validarProducto } = require('./productos.validate')
const log = require('../../../utils/logger')
const uuidV4 = require('uuid/v4')
const passport = require('passport')
//Base de datos en memoria
const { productos } = require('../../../database')
//Autenticacion
const authUser = passport.authenticate('jwt', { session: false })
// const productos = require('./database').productos
const productosRouter = express.Router()
//Routes
productosRouter.get('/', authUser, (req, res) => {
    res.json(productos)
})
productosRouter.post('/', [authUser, validarProducto], (req, res) => {
    let nuevoProducto = {
        ...req.body,
        id: uuidV4(),
        dueño: req.user.username
    }
    productos.push(nuevoProducto)
    log.info('Producto agregado', nuevoProducto)
    res.status(201).json(nuevoProducto) //201 created
})

productosRouter.get('/:id', (req, res) => {
    for (let producto of productos) {
        if (producto.id == req.params.id) {
            res.json(producto)
            return
        }
    }
    res.status(404).send(`El producto con el id [${req.params.id}] no fue encontrado`)
})
productosRouter.put('/:id', [authUser, validarProducto], (req, res) => { //Remplazos totales de productos que ya existen
    let reemplazoParaProducto = {
        ...req.body,
        id: req.params.id,
        dueño: req.user.username
    }

    let indice = _.findIndex(productos, producto => producto.id == reemplazoParaProducto.id) //Devuelve -1 si no lo encuentra
    //Si si lo encontro tendra un numero distinto a -1
    if (indice != -1) {
        if (productos[indice].dueño != reemplazoParaProducto.dueño) {
            res.status(401).send(`No eres el dueño del producto. [${reemplazoParaProducto.id}]. Solo puedes modificar productos creados por ti.`)
            log.info(`El usuario: [${req.user.username}] trato de modificar [${JSON.stringify(productos[indice])}] Operacion denegada. No es dueño`)
            return
        }
        productos[indice] = reemplazoParaProducto
        log.info(`El producto con el ${productos[indice].id} ha sido modificado`, reemplazoParaProducto)
        res.status(200).json(reemplazoParaProducto)

    } else {
        log.warn(`El producto con el [${reemplazoParaProducto.id}] no existe para modificar`)
        res.status(404).send(`El producto con el [${reemplazoParaProducto.id}] no existe`) //400 no existe
    }
})
productosRouter.delete('/:id', authUser, (req, res) => {
    let productoEliminar = {
        id: req.params.id,
        dueño: req.user.username
    }
    let indiceBorrar = _.findIndex(productos, producto => producto.id == id)

    
    if (indiceBorrar === -1) {
        log.warn(`El producto con el [${productoEliminar.id}] no existe para eliminar`)
        res.status(404).send(`Producto con id [${productoEliminar.id}] no existe. Nada que borrar`)
        return
    }

    if(productos[indiceBorrar].dueño != productoEliminar.dueño){
        log.warn(`El producto [${productoEliminar.id}] no le pertenece a [${productoEliminar.dueño}]. Operacion denegada para eliminar`)
        res.status(401).send(`El producto [${productoEliminar.id}] no te pertenece. Operacion denegada para eliminar, solo puedes eliminar productos tuyos. `)
        return
    }

    log.info(`Producto con ${productoEliminar.id} ha sido eliminado`)
    let borrado = productos.splice(indiceBorrar, 1)
    res.status(200).json(borrado)

})

module.exports = productosRouter
