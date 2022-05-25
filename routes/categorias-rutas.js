const { Router } = require('express');
const { check } = require('express-validator');
const { categoriasGet, categoriaGet, categoriasPut, categoriasPost, categoriasDelete } = require('../controllers/categorias-controllers');
const validarJWT = require('../middlewares/validar-jwt');
const { tieneRole } = require('../middlewares/validar-roles');


const router = Router();

router.get('/', categoriasGet);

router.get('/:id', [
    check('id', 'El id no es valido').isMongoId()
], categoriaGet);

router.put('/:id',
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
    check('id', 'El id no es valido').isMongoId()
    , categoriasPut);

router.post('/', [
    validarJWT,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
    check('nombre', 'El nombre es obligatorio').not().isEmpty()
], categoriasPost);

router.delete('/:id', [
    validarJWT,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
    check('id', 'El id no es valido').isMongoId()
], categoriasDelete);



module.exports = router;