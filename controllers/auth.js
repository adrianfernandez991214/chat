const { response, request } = require('express');
const Usuario = require('../database/usuario');
const Bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');
const { generarJWT } = require('../helpers/generar-jwt');

const login = async (req = request, res = response) => {

    //Resivir validacion de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { correo, password } = req.body;

    try {

        //Verificar si el correo existe
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({
                msg: 'Usuario / Password son incorrectos - correo no existe'
            });
        }

        //Verificar que el ususario este activo
        if (!usuario.estado) {
            return res.status(400).json({
                msg: 'Usuario / Password son incorrectos - estado no activo'
            });
        }

        //Verificar contraseña
        const validarPassword = Bcryptjs.compareSync(password, usuario.password);
        if (!validarPassword) {
            return res.status(400).json({
                msg: 'Usuario / Password son incorrectos - password'
            });
        }

        //Crear JWT
        const token = await generarJWT(usuario.id);

        res.json({
            usuario,
            token
        });
    } catch (error) {

        console.log(error);
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }

};

const renovarToken = async (req = request, res = response) => {

    const {usuario} = req;
 
    const token = await generarJWT(usuario.id);

    res.status(200).json({
        usuario,
        token
    })
};

module.exports = {
    login,
    renovarToken
}