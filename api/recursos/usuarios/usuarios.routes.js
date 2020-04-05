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
const procesarErrores = require('../../libs/errorHandler').procesarErrores
const { DatosDeUsuarioYaEnUso, CredencialesIncorrectas } = require('./usuarios.error')

function transformarBodyALowerCase(req, res, next) {
    req.body.username && (req.body.username = req.body.username.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}


usuariosRouter.get('/', procesarErrores((req, res) => {
    return usuariosController.obtenerUsuarios()
        .then(usuarios => {
            res.json(usuarios)
        })
}))
usuariosRouter.post('/', [validarUsuario, transformarBodyALowerCase], procesarErrores((req, res) => {
    let nuevoUsuario = req.body

    return usuariosController.usuarioExiste(nuevoUsuario.username, nuevoUsuario.email)
        .then(usuarioExiste => {
            if (usuarioExiste) {
                throw new DatosDeUsuarioYaEnUso()
            }
            return bcrypt.hash(nuevoUsuario.password, 10)
        })
        .then(hashPassword => {
            return usuariosController.crearUsuario(nuevoUsuario, hashPassword)
                .then(usuario => {
                    res.status(201).send(`Usuario creado exitosamente!`)
                    res.json(usuario)
                })

        })
}))

usuariosRouter.post('/login', [validarPedidoDeLogin, transformarBodyALowerCase], procesarErrores(async (req, res) => {
    let usuarioNoAutenticado = req.body

    let usuarioRegistrado = await usuariosController.obtenerUsuario({ username: usuarioNoAutenticado.username })

    if (!usuarioRegistrado) {
        log.info(`Usuario [${usuarioNoAutenticado.username}] No existe. No puede ser autenticado`)
        throw new CredencialesIncorrectas()
    }
    let contraseñaCorrecta = await bcrypt.compare(usuarioNoAutenticado.password, usuarioRegistrado.password)

    if (contraseñaCorrecta) {
        log.info(`Usuario: ${usuarioRegistrado.username} autenticado!`)
        let token = jwt.sign({ id: usuarioRegistrado._id }, config.jwt.secreto, { expiresIn: config.jwt.tiempoDeExpiracion })
        res.json({ token })
    } else {
        log.info(`Usuario ${usuarioNoAutenticado.username} no completo autenticación. Contraseña incorrecta.`)
        throw new CredencialesIncorrectas()
    }

}))


module.exports = usuariosRouter