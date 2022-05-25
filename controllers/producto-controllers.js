const { response, request } = require('express');
const { validationResult } = require('express-validator');
const Categoria = require('../database/categoria');
const Producto = require('../database/producto');

const productosGet = async (req = request, res = response) => {

    const { desde = 0, limite = 5 } = req.query;
    const query = { estado: true };

    const [total, productos] = await Promise.all([
        Producto.countDocuments(query),
        Producto.find(query)
            .populate('usuario', 'nombre')
            .populate('categoria', 'nombre')
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.json({
        msg: "Get todos",
        total,
        productos
    });

};

const productoGet = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { id } = req.params;

    const existeProducto = await Producto.findById(id)
        .populate('usuario', 'nombre')
        .populate('categoria', 'nombre');
    if (!existeProducto) {
        return res.status(400).json({
            msg: 'EL id no existe - categoria no existe'
        });
    }

    res.json({
        msg: "Get uno",
        existeProducto
    });

};

const productosPost = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { nombre, precio, categoria, descripcion } = req.body;
    const usuario = req.usuario._id;

    //revisar si el id que pasan para la categoria existe 
    const existeIdCategoria = await Categoria.findById(categoria);
    if (!existeIdCategoria) {
        return res.status(400).json({
            msg: 'EL id de categoria no existe'
        });
    }

    //revisar si el nombre nuevo de producto ya existe 
    const existeProducto = await Producto.findOne({ nombre });
    if (existeProducto) {
        return res.status(400).json({
            msg: 'Esa categoria ' + nombre + ' ya esta registrado'
        });
    }

    
    const producto = new Producto({ nombre: nombre.toUpperCase(), precio, categoria, descripcion, usuario });

    await producto.save();

    res.json({
        msg: "Post",
        producto
    });

};

const productosPut = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { id } = req.params;
    const { _id, estado, ...resto } = req.body
    const categoria = resto.categoria;

    //Comprobar si producto existe
    const existeProducto = await Producto.findById(id);
    if (!existeProducto) {
        return res.status(400).json({
            msg: 'EL id no existe - producto no existe'
        });
    }

    //revisar si el nombre del producto existe
    const existeNombre = await Producto.findOne({ nombre: resto.nombre });
    if (existeNombre && existeNombre._id != id) {
        return res.status(400).json({
            msg: 'Esa categoria ' + resto.nombre + ' ya esta registrado'
        });
    }

    //revisar si el id que pasan para la categoria existe 
    const existeIdCategoria = await Categoria.findById(categoria);
    if (!existeIdCategoria) {
        return res.status(400).json({
            msg: 'EL id de categoria no existe'
        });
    }


    resto.usuario = req.usuario._id;

    const producto = await Producto.findByIdAndUpdate(id, resto, { new: true });

    res.json({
        msg: "Put",
        producto,
    });

};

const productosDisponible = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { id, disponible } = req.params;

    //Comprobar si producto existe
    const existeProducto = await Producto.findById(id);
    if (!existeProducto) {
        return res.status(400).json({
            msg: 'EL id no existe - producto no existe'
        });
    }

    const producto = await Producto.findByIdAndUpdate(id, { disponible, usuario: req.usuario._id }, { new: true });

    res.json({
        msg: "Disponible",
        producto
    });

};

const productosDelete = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { id } = req.params;

    //Comprobar si producto existe
    const existeProducto = await Producto.findById(id);
    if (!existeProducto) {
        return res.status(400).json({
            msg: 'EL id no existe - producto no existe'
        });
    }

    const producto = await Producto.findByIdAndUpdate(id, { estado: false, usuario: req.usuario._id }, { new: true });

    res.json({
        msg: "Deletes",
        producto
    });

};

module.exports = {
    productosGet,
    productoGet,
    productosPost,
    productosPut,
    productosDisponible,
    productosDelete
}