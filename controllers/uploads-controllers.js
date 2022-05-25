const path = require('path');
const fs = require('fs');

const { response, request } = require('express');
const { validationResult } = require('express-validator');
const { subirArchivo } = require('../helpers/subir-archivo');
const Usuario = require('../database/usuario');
const Producto = require('../database/producto');

const uploads = async (req = request, res = response) => {

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo) {
        res.status(400).json({ msg: 'No hay archivo para subir' });
        return;
    }

    try {
        //const nombre = await subirArchivo(req.files, ['txt', 'md'] , 'text');
        const nombre = await subirArchivo(req.files, undefined, 'img');
        res.status(201).json({ nombre });
    } catch (msg) {
        res.status(400).json({ msg })
    }

};

const actualizarImagen = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {

        case 'usuarios':
            //compruevo si el id existe en usuarios
            modelo = await Usuario.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: 'No existe un usuario con el id - ' + id
                });
            }
            break;

        case 'productos':
            //compruevo si el id existe en productos
            modelo = await Producto.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: 'No existe un producto con el id - ' + id
                });
            }
            break;

    }

    //Limpiar imagenes previas
    if (modelo.img) {
        //Hay que borrar las imagenes del servidor
        const pathImagen = path.join(__dirname, '../uploads', coleccion, modelo.img);
        if (fs.existsSync(pathImagen)) {
            fs.unlinkSync(pathImagen);
        }
    }

    const nombre = await subirArchivo(req.files, undefined, coleccion);
    modelo.img = nombre;

    modelo.save();

    res.status(201).json(modelo);

};

const mostrarImagen = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {

        case 'usuarios':
            //compruevo si el id existe en usuarios
            modelo = await Usuario.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: 'No existe un usuario con el id - ' + id
                });
            }
            break;

        case 'productos':
            //compruevo si el id existe en productos
            modelo = await Producto.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: 'No existe un producto con el id - ' + id
                });
            }
            break;

    }

    //Limpiar imagenes previas
    if (modelo.img) {
        //Hay que borrar las imagenes del servidor
        const pathImagen = path.join(__dirname, '../uploads', coleccion, modelo.img);
        if (fs.existsSync(pathImagen)) {
            return res.sendFile(pathImagen);
        }
    }

    const pathNoImagen = path.join(__dirname, '../assets', 'no-image.jpg.jpg');
    res.status(200).sendFile(pathNoImagen);

};

module.exports = {
    uploads,
    actualizarImagen,
    mostrarImagen
}