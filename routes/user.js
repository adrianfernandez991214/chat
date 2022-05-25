const { Router } = require('express');
const { check } = require('express-validator');
const { usuariosGet, usuariosPut, usuariosPost, usuariosDelete } = require('../controllers/usuarios');
const validarJWT = require('../middlewares/validar-jwt');
const { esAdminRole, tieneRole } = require('../middlewares/validar-roles');
const router = Router();

router.get('/', usuariosGet);

router.put('/:id', [
    check('id', 'El id no es valido').isMongoId(),
    check('rol', 'El rol no es valido').isIn(['ADMIN_ROLE', 'USER_ROLE'])
], usuariosPut);

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('correo', 'El correo  no es validor').isEmail(),
    check('password', 'El password debe ser mas de 6 letras').isLength({ min: 6 }),
    check('rol', 'El rol no es valido').isIn(['ADMIN_ROLE', 'USER_ROLE','VISITANTE_ROLE'])
], usuariosPost);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
    check('id', 'El id no es valido').isMongoId()
], usuariosDelete);


module.exports = router; 