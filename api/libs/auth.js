const bcrypt = require('bcrypt')
const _ = require('underscore')
const logger = require('../../utils/logger')
const usuarios = require('../../database').usuarios
const passportJWT = require('passport-jwt')
const config = require('../../config')

let jwtOptions = {
    secretOrKey: config.jwt.secreto,
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}
//jwtOptions -> es para configuracion del passportJWT Strategy
module.exports = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => { //jwtPayload es el token que recib en formato JSON
    let index = _.findIndex(usuarios, usuario => usuario.id == jwtPayload.id)
    if (index == -1) {
        logger.info(`El usuario ${usuarios[index].username} no existe`)
        next(null, false)
    } else {
        logger.info(`El usuario ${usuarios[index].username} es autenticado`)
        next(null, {
            username: usuarios[index].username,
            id: usuarios[index].id
        })
    }
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