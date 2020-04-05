const Joi = require('joi')
const fileType = require('file-type')
const log = require('../../../utils/logger')

const blueprintProducto = Joi.object().keys({
    titulo: Joi.string().max(100).required(),
    precio: Joi.number().positive().precision(2).required(),
    moneda: Joi.string().length(3).uppercase().required()
})

const MIME_TYPE_VALIDOS = ['image/jpeg', 'image/jpg', 'image/png']
function validarImagenDeProducto(req, res, next) {

    let contentType = req.get('content-type')
    if (!MIME_TYPE_VALIDOS.includes(contentType)) {
        res.status(400).send(`Archivos de tipo ${contentType} no son soportados. Usar uno de ${MIME_TYPE_VALIDOS.join(", ")}`)
        return
    }

    let fileInfo = fileType(req.body)
    if (!MIME_TYPE_VALIDOS.includes(fileInfo.mime)) {
        res.status(400).send(`Disparidad entre content-type [${contentType}] y tipo de archivo [${fileInfo.ext}]. Request no será procesado`)
        return
    }

    // Agregar la extension al request para que la podamos usar al guardar la imagen
    req.extensionDeArchivo = fileInfo.ext
    next()
}

function validarDataDeProducto(req, res, next) {
    let resultado = Joi.validate(req.body, blueprintProducto, { abortEarly: false, convert: false })
    if (resultado.error === null) {
        next()
    } else {
        let erroresDeValidacion = resultado.error.details.reduce((acumulador, error) => {
            return acumulador + `[${error.message}]`
        }, "")

        log.warn('El siguiente producto no pasó la validación: ', req.body, erroresDeValidacion)
        res.status(400).send(`El producto en el body debe especificar titulo, precio y moneda. Errores en tu request: ${erroresDeValidacion}`)
    }
}

module.exports = {
    validarImagenDeProducto,
    validarDataDeProducto
}