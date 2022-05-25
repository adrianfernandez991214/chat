const { Router } = require('express');
const { check } = require('express-validator');
const { productosGet, productoGet, productosPost, productosPut, productosDelete, productosDisponible } = require('../controllers/producto-controllers');
const validarJWT = require('../middlewares/validar-jwt');
const { esAdminRole, tieneRole } = require('../middlewares/validar-roles');
const router = Router();

router.get('/', productosGet);

router.get('/:id', [
    check('id', 'El id no es valido').isMongoId()
], productoGet);

router.post('/', [
    validarJWT,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('categoria', 'La categoria es obligatoria que sea un id de mongoDB').isMongoId()
], productosPost);

router.put('/:id', [
    validarJWT,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
    check('id', 'El id no es valido').isMongoId()
], productosPut);

router.put('/disponible/:id/:disponible', [
    validarJWT,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
    check('id', 'El id no es valido').isMongoId(),
    check('disponible', 'El parametro disponible debe der boolean ').isBoolean()
], productosDisponible);

router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'El id no es valido').isMongoId(),
], productosDelete);

module.exports = router;