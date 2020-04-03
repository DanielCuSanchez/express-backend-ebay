
const Joi = require('joi')
const logger = require('../../../utils/logger')
const blueprintProducto = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(200).required(),
    email: Joi.string().email().required()
})

let validarUsuario = (req, res, next) => {
    const resultado = Joi.validate(req.body, blueprintProducto, { abortEarly: false, convert: false })
    if (resultado.error == null) {
        next()
    } else {
        logger.info('El producto no puede ser validado', resultado.error.details.map(error => error.message))
        res.status(400).send(
            "Información del usuario no cumple con los requisitos: " +
            "El nombre del usuario debe ser alfanumerico y tener entre 3 y 6 caracteres, password y email"
        )
    }
}
const blueprintPedidoLogin = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
})

let validarPedidoDeLogin = (req, res, next) => {
    const resultado = Joi.validate(req.body, blueprintPedidoLogin, { abortEarly: false, convert: false })
    if (resultado.error == null) {
        next()
    }
    else {
        res.status(400).send(
            "Login no cumple con los requisitos: " +
            "Usuario y contraseña requeridos"
        )
    }
}

module.exports = {
    validarUsuario,
    validarPedidoDeLogin
}