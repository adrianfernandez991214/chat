const { Router } = require('express');
const { check } = require('express-validator');
const { uploads, actualizarImagen, mostrarImagen } = require('../controllers/uploads-controllers');
const { validarArchivoSubir } = require('../middlewares/validar-archivo');
const router = Router();

router.post('/', uploads);

router.put('/:coleccion/:id', [
    validarArchivoSubir,
    check('id', 'El id de ser un id de mongo').isMongoId(),
    check('coleccion', 'La coleccion no es permitida').isIn(['usuarios', 'productos'])
], actualizarImagen)

router.get('/:coleccion/:id', [
    check('id', 'El id de ser un id de mongo').isMongoId(),
    check('coleccion', 'La coleccion no es permitida').isIn(['usuarios', 'productos'])
], mostrarImagen)

module.exports = router;