const ambiente = process.env.NODE_ENV || 'dev'
let configuracionBase = {
    jwt: {},
    puerto: 3010,
    s3: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
}

let configuracionAmbiente = {}

switch (ambiente) {
    case 'desarrollo':
    case 'dev':
    case 'development':
        configuracionAmbiente = require('./dev')
        break
    case 'produccion':
    case 'prod':
    case 'production':
        configuracionAmbiente = require('./prod')
        break
    default:
        configuracionAmbiente = require('./dev')
}
console.log({ ...configuracionBase, ...configuracionAmbiente })

module.exports = {
    ...configuracionBase,
    ...configuracionAmbiente
}