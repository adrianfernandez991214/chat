const { response, request } = require('express');
const Categoria = require('../database/categoria');
const Producto = require('../database/producto');
const { ObjectId } = require('mongoose').Types;
const Usuarios = require('../database/usuario');

const coleccionesPermitidas = [
    'usuarios',
    'categorias',
    'productos'
];

const buscarUsuario = async (termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // true

    if (esMongoID) {
        const usuario = await Usuarios.findById(termino);
        return res.status(201).json({
            results: (usuario) ? [usuario] : []
        })
    }

    const regex = new RegExp(termino, 'i');
    const usuarios = await Usuarios.find({
        $or: [{ nombre: regex }, { correo: regex }],
        $and: [{ estado: true }]
    });

    return res.status(201).json({
        results: usuarios
    });

}

const buscarCategotia = async (termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // true

    if (esMongoID) {
        const categoria = await Categoria.findById(termino);
        return res.status(201).json({
            results: (categoria) ? [categoria] : []
        })
    }

    const regex = new RegExp(termino, 'i');
    const categoria = await Categoria.find({ nombre: regex, estado: true });

    return res.status(201).json({
        results: categoria
    });
}

const buscarProducto = async (termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // true

    if (esMongoID) {
        const producto = await Producto.findById(termino).populate('categoria','nombre');
        return res.status(201).json({
            results: (producto) ? [producto] : []
        })
    }

    const regex = new RegExp(termino, 'i');
    const producto = await Producto.find({ nombre: regex, estado: true }).populate('categoria','nombre')
    ;

    return res.status(201).json({
        results: producto
    });
}

const buscar = async (req = request, res = response) => {

    const { coleccion, termino } = req.params;

    if (!coleccionesPermitidas.includes(coleccion)) {
        return res.status(400).json({
            msg: 'No es una coleccion permirida'
        });
    }

    switch (coleccion) {
        case 'usuarios':
            buscarUsuario(termino, res);
            break;

        case 'categorias':
            buscarCategotia(termino, res);
            break;

        case 'productos':
            buscarProducto(termino, res);
            break;
    }
};

module.exports = {
    buscar
}