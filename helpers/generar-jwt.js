const JWT = require('jsonwebtoken');
const Usuario = require('../database/usuario');

const generarJWT = (uid = '') => {

    return new Promise((resolve, reject) => {

        const poyload = { uid };

        JWT.sign(poyload, process.env.SECRETORPRIVATEKEY, {
            expiresIn: '10h'
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se pudo general el JWT');
            } else {
                resolve(token);
            }
        });

    })

}

const comprobarJWT = async (token = '') => {

    try {

        if (token.length <= 10) {
            return null;
        }

        const { uid } = JWT.verify(token, process.env.SECRETORPRIVATEKEY);

        const usuario = await Usuario.findById(uid);

        if (usuario && usuario.estado) {
           return usuario;
        } else {
            return null;
        }

    } catch (error) {
        return null;
    }

}

module.exports = {
    generarJWT,
    comprobarJWT
}