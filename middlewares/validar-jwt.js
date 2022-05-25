const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../database/usuario');


const validarJWT = async (req = request, res = response, next) => {

    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            msg: "El token no existe"
        });
    }

    try {

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        //Leer el usuario correspondiente al uid
        const usuario = await Usuario.findById(uid);
        if (!usuario) {
            return res.status(401).json({
                msg: 'Token no valido - Usuario no existe'
            });
        }

        //Vererificar si uid tiene el estado en true
        if (!usuario.estado) {
            return res.status(401).json({
                msg: 'Token no valido - Estado de ususario en false'
            });
        }

        req.usuario = usuario;
        next();

    } catch (error) {

        console.log(error);
        res.status(401).json({
            msg: "token no valido"
        });

    }

};

module.exports = validarJWT;