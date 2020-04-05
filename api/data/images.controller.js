const AWS = require('aws-sdk')
const config = require('../../config/index')
const s3Client = new AWS.S3({ ...config.s3 })

function guardarImagen(imageData, nombreDelArchivo) {
    return s3Client.putObject(
        {
            Bucket: 'danielcu-ebay',
            Key: `imagenes/${nombreDelArchivo}`,
            Body: imageData
        }
    ).promise()
}

module.exports = {
    guardarImagen
}