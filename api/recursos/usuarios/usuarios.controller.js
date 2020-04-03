const Usuario = require('./usuarios.model')

function obtenerUsuarios() {
    return Usuario.find()
}

function obtenerUsuario({
    username: username,
    id: id
}) {
    if (username) return Usuario.findOne({ username: username })
    if (id) return Usuario.findById({ _id: id })
    throw new Error(`Funcion obtener usuario del controller fue llamada sin especificar username o id`)
}

function crearUsuario(usuario, hashedPassword) {
    return new Usuario({
        ...usuario,
        password: hashedPassword
    }).save()
}
function usuarioExiste(username, email) {
    return new Promise((resolve, reject) => {
        Usuario.find().or([{ 'username': username }, { 'email': email }])
            .then(usuarios => {
                resolve(usuarios.length > 0)
            })
            .catch(e => {
                reject(e)
            })
    })

}
module.exports = {
    obtenerUsuarios,
    obtenerUsuario,
    crearUsuario,
    usuarioExiste
}