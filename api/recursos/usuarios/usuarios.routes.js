const express = require('express')
const _ = require('underscore')
const uuid4 = require('uuid/v4')
const log = require('../../../utils/logger')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const usuariosRouter = express.Router()

const usuariosController = require('./usuarios.controller')
const validarUsuario = require('./usuarios.validate').validarUsuario
const validarPedidoDeLogin = require('./usuarios.validate').validarPedidoDeLogin
const config = require('../../../config')

function transformarBodyALowerCase(req, res, next) {
    req.body.username && (req.body.username = req.body.username.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}


usuariosRouter.get('/', (req, res) => {
    usuariosController.obtenerUsuarios()
        .then(usuarios => {
            res.json(usuarios)
        })
        .catch(e => {
            res.status(500).send('Error al obtener los usuarios')
        })
})
usuariosRouter.post('/', [validarUsuario, transformarBodyALowerCase], (req, res) => {
    let nuevoUsuario = req.body

    usuariosController.usuarioExiste(nuevoUsuario.username, nuevoUsuario.email)
        .then(usuarioExiste => {
            if (usuarioExiste) {
                log.warn(`Email [${nuevoUsuario.email}] o username [${nuevoUsuario.username}] ya existen en DB`)
                res.status(409).send(`Email [${nuevoUsuario.email}] o username [${nuevoUsuario.username}] ya existen en DB`)
                return
            }

            bcrypt.hash(nuevoUsuario.password, 10, (error, hashPassword) => {
                if (error) {
                    log.error(`Error ocurrio al tratar de obtener el hash de la una contraseña`, error)
                    res.status(500).send(`Error procesando la creación del usuario`)
                    return
                }
                usuariosController.crearUsuario(nuevoUsuario, hashPassword)
                    .then(usuario => {
                        res.status(201).send(`Usuario creado exitosamente!`)
                    })
                    .catch(e => {
                        log.error(`Error al crear el usuario`, e)
                        res.status(500).send(`Error procesando la creación del usuario`)
                    })
            })
        })
        .catch(e => {
            log.error(`Ocurrio un error al tratar de verificar usuario [${nuevoUsuario.username}] estaba en la DB`)
            res.status(500).send(`Error al tratar de verificar su usuario o email`)
        })
})

usuariosRouter.post('/login', [validarPedidoDeLogin, transformarBodyALowerCase], async (req, res) => {
    let usuarioNoAutenticado = req.body
    let usuarioRegistrado

    try {
        usuarioRegistrado = await usuariosController.obtenerUsuario({ username: usuarioNoAutenticado.username })
    } catch (error) {
        log.error(`Error al obtener el usuario [${usuarioNoAutenticado.username}]`, error)
        res.status(500).send(`Ocurrio un error durante el proceso de login`)
        return
    }

    if (!usuarioRegistrado) {
        log.info(`Usuario [${usuarioNoAutenticado.username}] No existe. No puede ser autenticado`)
        res.status(400).send(`Error. Asegurate de tener las credenciales correctar. Usuario y constraseña`)
        return
    }
    let contraseñaCorrecta
    try {
        contraseñaCorrecta = await bcrypt.compare(usuarioNoAutenticado.password, usuarioRegistrado.password)
    } catch (error) {
        log.error(`Error al comparar la contraseña del usuario [${usuarioRegistrado.username}]`)
        res.status(400).send(`Error. Asegurate de tener las credenciales correctar. Usuario y constraseña`)
        return
    }

    if (contraseñaCorrecta) {
        log.info(`Usuario: ${usuarioRegistrado.username} autenticado!`)
        let token = jwt.sign({ id: usuarioRegistrado._id }, config.jwt.secreto, { expiresIn: config.jwt.tiempoDeExpiracion })
        res.json({ token })
    } else {
        log.info(`Usuario ${usuarioNoAutenticado.username} no completo autenticación. Contraseña incorrecta.`)
        res.status(400).send(`El usuario: ${usuarioNoAutenticado.username}, no completo autenticación. Password incorrecta`)
    }

})


module.exports = usuariosRouter