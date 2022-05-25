const { response, request } = require('express');
const { validationResult } = require('express-validator');
const Categoria = require("../database/categoria")

const categoriasGet = async (req = request, res = response) => {

    const { desde = 0, limite = 5 } = req.query;
    const query = { estado: true };

    const [total, categorias] = await Promise.all([
        Categoria.countDocuments(query),
        Categoria.find(query)
            .populate('usuario', 'nombre')
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.json({
        total,
        categorias
    });
}

const categoriaGet = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { id } = req.params;

    //compruevo si el id existe
    const existeID = await Categoria.findById(id).populate('usuario', 'nombre');
    if (!existeID) {
        return res.status(400).json({
            msg: 'EL id no existe'
        });
    }

    res.json({
        existeID
    });
};

const categoriasPut = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    //resivir categoria
    const { id } = req.params;
    const { estado, usuario, ...resto } = req.body;
    const nombre = resto.nombre;
    const { _id } = req.usuario;

    //revisar si el id que pasan el la url no existe 
    const existeID = await Categoria.findById(id);
    if (!existeID) {
        return res.status(400).json({
            msg: 'EL id no existe'
        });
    }

    //revisar si el nombre nuevo ya existe 
    const existeCategoriaBody = await Categoria.findOne({ nombre });
    if (existeCategoriaBody) {
        return res.status(400).json({
            msg: 'Esa categoria ' + nombre + ' ya esta registrado'
        });
    }

    resto.usuario = _id;

    const categoria = await Categoria.findByIdAndUpdate(id, resto, { new: true });

    res.json({
        msg: "PUT",
        categoria
    });

}

const categoriasPost = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { nombre } = req.body;
    const usuario = req.usuario._id;

    //revisar si existe ya
    const existeCategoria = await Categoria.findOne({ nombre });
    if (existeCategoria) {
        return res.status(400).json({
            msg: 'Esa categoria ' + nombre + ' ya esta registrado'
        });
    }

    const categoria = new Categoria({ nombre, usuario });
    await categoria.save();

    res.status(201).json(categoria);

}

const categoriasDelete = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { id } = req.params;

    //compruevo si el id existe
    const existeID = await Categoria.findById(id);
    if (!existeID) {
        return res.status(400).json({
            msg: 'EL id no existe'
        });
    }

    const categotia = await Categoria.findByIdAndUpdate(id, { estado: false });

    res.json({
        msg: "DELETE",
        categotia
    });

}

module.exports = {
    categoriasGet,
    categoriaGet,
    categoriasPut,
    categoriasPost,
    categoriasDelete
};