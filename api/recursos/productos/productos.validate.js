
const Joi = require('joi')
const blueprintProducto = Joi.object().keys({
    titulo: Joi.string().max(100).required(),
    precio: Joi.number().positive().precision(2).required(),
    moneda: Joi.string().length(3).uppercase().required()
})
//Middleware
const validarProducto = (req, res, next) => {
    let resultado = Joi.validate(req.body,blueprintProducto, { abortEarly: false, convert:false})
    //console.log(resultado.error)
    if(resultado.error == null){
        next()
    }
    else{
        //console.log(resultado.error)
        let erroresDeValidacion = resultado.error.details.reduce((acumulador, error)=>{
            return acumulador + `[${error.message}]` //accedemos a la propiedad mensaje de cada error
        },"")
        //console.log(erroresDeProducto)
        res.status(400).send(`El producto en el body debe especificar titulo, precio y moneda.
            Errores en tu request: ${erroresDeValidacion}
        `)
    }
}
module.exports = {validarProducto}