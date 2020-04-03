const express = require('express')
const _ = require('underscore')
const uuid4 = require('uuid/v4')
const log = require('../../../utils/logger')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const usuariosRouter = express.Router()

const validarUsuario = require('./usuarios.validate').validarUsuario
const validarPedidoDeLogin  = require('./usuarios.validate').validarPedidoDeLogin
const usuarios = require('../../../database').usuarios
const config = require('../../../config')
usuariosRouter.get('/', (req, res) => {
    res.json(usuarios)
})
usuariosRouter.post('/', validarUsuario, (req, res) => {
    let nuevoUsuario = req.body
    let index = _.findIndex(usuarios, usuario => {
        return usuario.username === nuevoUsuario.username || usuario.email === nuevoUsuario.email
    })
    if (index != -1) {
        //409 conflict 
        log.info('El email o username ya estan asociados a una cuenta en DB', nuevoUsuario)
        res.status(409).send(`El email o username ya estan asociados a una cuenta`)
        return
    }
    bcrypt.hash(nuevoUsuario.password, 10, (err, hashedPassword) => {
        if (err) {
            //internal err server
            log.error('Error ocurrió al tratar de obtener el hash de contraseña')
            res.status(500).send(`Ocurrio un error procesando creación de usuario`)
        }
        usuarios.push({
            username: nuevoUsuario.username,
            email: nuevoUsuario.email,
            password: hashedPassword,
            id: uuid4()
        })
        res.status(201).send(`Usuario creado exitosamente!`)
    })
})

usuariosRouter.post('/login',validarPedidoDeLogin, (req, res) => {
    let usuarioNoAutenticado = req.body
    let index = _.findIndex(usuarios, usuario => usuario.username == usuarioNoAutenticado.username)
    if (index == -1) {
        log.info(`Usuario: ${usuarioNoAutenticado.username}, no pudo completar autenticación. Usuario incorrecto`)
        res.status(400).send(`El usuario: ${usuarioNoAutenticado.username}, NO EXISTE USUARIO`)
        return
    }
    let hashedPassword = usuarios[index].password
    bcrypt.compare(usuarioNoAutenticado.password, hashedPassword, (err, booleanIguales) => {

        if (booleanIguales) {
           //Entrar y generar token
           log.info(`Usuario: ${usuarioNoAutenticado.username} autenticado!`)
           let token = jwt.sign({ id: usuarios[index].id} ,config.jwt.secreto,{expiresIn: config.jwt.tiempoDeExpiracion})
           res.json({token})
        }
        else {
            log.info(`Usuario ${usuarioNoAutenticado.username} no completo autenticación. Contraseña incorrecta.`)
            res.status(400).send(`El usuario: ${usuarioNoAutenticado.username}, no completo autenticación. Password incorrecta`)
        }
    })
})


module.exports = usuariosRouter