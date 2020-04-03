//Base de datos en memoria
const productos = [
    { id: '1', titulo: 'Macbook pro', precio: 1300, moneda: 'USD' },
    { id: '2', titulo: 'Iphone 6s', precio: 130, moneda: 'USD' },
    { id: '3', titulo: 'Microfono para grabar PRO', precio: 200, moneda: 'USD' },
    { id: '4', titulo: 'Iphone 8 plus', precio: 130, moneda: 'USD' },
    { id: '5', titulo: 'Microondas para PRO', precio: 200, moneda: 'USD' },
]
const usuarios = []

module.exports = {
    productos,
    usuarios
}