const bcrypt = require('bcrypt')
const _ = require('underscore')
const passportJWT = require('passport-jwt')

const logger = require('../../utils/logger')
const config = require('../../config')
const usuarioController = require('../recursos/usuarios/usuarios.controller')


let jwtOptions = {
    secretOrKey: config.jwt.secreto,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}
//jwtOptions -> es para configuracion del passportJWT Strategy
module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => { //jwtPayload es el token que recib en formato JSON
    //console.log(jwtPayload.id)
    usuarioController.obtenerUsuario({ id: jwtPayload.id })
        .then(usuario => {
            if (!usuario) {
                logger.info(`JWT Token no es válido. Usuario con ID [${jwtPayload.id}] NO EXISTE`)
                next(null, false)//No ocurrio error pero fallo la validación del token 
                return
            }
            logger.info(`El usuario [${usuario.username}] suministro token válido!`)
            next(null, {
                username: usuario.username,
                id: usuario._id
            })

        })
        .catch(error => {
            logger.error(`Ocurrio un error al validar el token del usuario id[${jwtPayload.id}]`, error)
            next(error, false)
        })

})


//Primer codigo
 // if (username.valueOf() == 'daniel' && password.valueOf() == 'cu') {
    //     return done(null, true)
    // }
    // else {
    //     return done(null, false)
    // }


//Segundo cod
//     let index = _.findIndex(usuarios, usuario => usuario.username == username)
//    if(index == -1){
//        logger.info(`Usuario: ${username}, no pudo completar autenticación. Usuario incorrecto`)
//        done(null, false)
//        return
//    }
//    let hashedPassword = usuarios[index].password
//    bcrypt.compare(password, hashedPassword, (err, booleanIguales)=>{
//        if(!booleanIguales){
//            logger.info(`El usuario: ${username}, no completo autenticación. Password incorrecta`)
//            done(null, false)
//            return
//        }
//        else{
//            logger.info(`Usuario: ${username}, autenticación existosa!`)
//            done(null, true)
//        }
//    })