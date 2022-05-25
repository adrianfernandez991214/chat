const express = require('express');
const { response, request } = require('express');
const Usuario = require('../database/usuario');
const Bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');


const usuariosGet = async (req = request, res = response) => {

    const { desde = 0, limite = 10 } = req.query;
    const query = { estado: true };

    //Este codigo comentado es porque las promesas se corren una destras de la otra
    //pero como no dependen una de la otra no se pueden correr simultaneamente
    /*const usuarios = await Usuario.find(query)
        .skip(Number(desde))
        .limit(Number(limite));

    const total = await Usuario.countDocuments(query);*/

    //Por eso es que hacen asi, para que corran al mismo tiempo, si una falla todas fallan
    const [total, usuarios] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.json({
        total,
        usuarios
    });
};

const usuariosPut = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    //resivir y estructural datos
    const { id } = req.params;
    const { _id, password, google, ...resto } = req.body;

    //Verificar si el id existe
    const existeID = await Usuario.findById(id);
    if (!existeID) {
        return res.status(400).json({
            msg: 'EL id no existe'
        });
    }

    //validar contra base de datos
    if (password) {
        //Encriptar la contraseña
        const salt = Bcryptjs.genSaltSync();
        resto.password = Bcryptjs.hashSync(password, salt);
    }

    const usuario = await Usuario.findByIdAndUpdate(id, resto);

    res.json({
        msg: 'put api',
        usuario
    });
};

const usuariosPost = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { nombre, correo, password, rol } = req.body;
    const usuario = Usuario({ nombre, correo, password, rol });
    //Verificar si el correo existe
    const existeEmail = await Usuario.findOne({ correo });
    if (existeEmail) {
        return res.status(400).json({
            msg: 'Ese correo ya esta registrado'
        });
    }

    //Incriptar contraseña
    const salt = Bcryptjs.genSaltSync();
    usuario.password = Bcryptjs.hashSync(password, salt);

    //Guerdar datos
    await usuario.save();


    res.status(201).json({
        usuario
    });
};

const usuariosDelete = async (req = request, res = response) => {

    //tratamiento de errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    //resivo parametros
    const { id } = req.params;
    const usuarioLogin = req.usuario;

    //compruevo si el id existe
    const existeID = await Usuario.findById(id);
    if (!existeID) {
        return res.status(400).json({
            msg: 'EL id no existe'
        });
    }

    //Eliminar fisicamente de la bse de datos
    //const usuario = await Usuario.findByIdAndDelete(id);

    //solo cambiar el estado para no perder la integridad referencial
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });

    res.json({
        usuario,
        usuarioLogin
    });
};

module.exports = {
    usuariosGet,
    usuariosPut,
    usuariosPost,
    usuariosDelete
}