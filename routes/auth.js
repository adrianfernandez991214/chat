const { Router } = require('express');
const { check } = require('express-validator');
const { login, renovarToken } = require('../controllers/auth');
const validarJWT = require('../middlewares/validar-jwt')
const router = Router();

router.post('/login', [
    check('correo', 'El correo  no es validor').isEmail(),
    check('password', 'El password es obligatorio').not().isEmpty()
], login);

router.get('/', validarJWT, renovarToken);


module.exports = router;