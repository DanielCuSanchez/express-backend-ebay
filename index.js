const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const passport = require('passport')
const mongoose = require('mongoose')
const app = express()

const config = require('./config')
const productosRouter = require('./api/recursos/productos/productos.routes')
const usuariosRouter = require('./api/recursos/usuarios/usuarios.routes')
const logger = require('./utils/logger')
const errorHandler = require('./api/libs/errorHandler')

//Database
mongoose.connect('mongodb://127.0.0.1:27017/ebay', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const mongo = mongoose.connection
mongo.on('error', () => {
    logger.error('Fallo la conexion de mongo db')
    process.exit(1)
})
    .once('open', () => {
        console.log('Database connected')
    })

//const BasicStrategy = require('passport-http').BasicStrategy
const authJWT = require('./api/libs/auth')
//passport.use(new BasicStrategy(auth))
passport.use(authJWT)
app.use(bodyParser.json())//content-type application/json
app.use(bodyParser.raw({ type: 'image/*', limit: '1mb' })) //content-type image/*
app.use(morgan('short', {
    stream: {
        write: message => logger.info(message.trim())
    }
}))

app.use(passport.initialize())

app.use('/productos', productosRouter)
app.use('/usuarios', usuariosRouter)
app.use(errorHandler.procesarErroresDeDB)
app.use(errorHandler.procesarErroresDeTamañoDeBody)
if (config.ambiente === 'prod') {
    app.use(errorHandler.erroresEnProducción)
}
if (config.ambiente === 'dev') {
    app.use(errorHandler.erroresEnDesarrollo)
}

// app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
//     //console.log(req.user)
//     logger.info(JSON.stringify(req.user))
//     res.send(`Vende en ebay.com`)
// })

app.listen(config.puerto, () => {
    logger.info(`http://localhost:${config.puerto}`)
})