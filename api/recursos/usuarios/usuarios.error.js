class DatosDeUsuarioYaEnUso extends Error {
    constructor(message) {
        super(message)
        this.message = message || 'El email o usuario ya estan asociados a una cuenta'
        this.status = 409
        this.name = 'DatosDeUsuarioYaEnUso'
    }
}

class CredencialesIncorrectas extends Error {
    constructor(message) {
        super(message)
        this.message = message || 'Credenciales incorrectas. Asegurate de que el username y contraseña sean correctas'
        this.status = 400
        this.name = 'CredencialesIncorrectas'
    }
}

module.exports = {
    DatosDeUsuarioYaEnUso,
    CredencialesIncorrectas
}