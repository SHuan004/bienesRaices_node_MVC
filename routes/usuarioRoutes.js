import express from "express";
import { cerrarSesion,formularioLogin ,formularioRegistro,formularioOlvidePassword,registrar, confirmar , reiniciarPassword,comprobarToken, nuevoPassword
    , iniciarSesion} from "../controllers/usuarioController.js";

const router = express.Router();

//Routing
router.get('/login', formularioLogin);
router.post('/login', iniciarSesion);

//cerrar sesion
router.post('/cerrar-sesion', cerrarSesion)

router.get('/registro',  formularioRegistro)
router.post('/registro',  registrar)

router.get('/olvide-password',  formularioOlvidePassword)
router.post('/olvide-password', reiniciarPassword)

router.get('/confirmar/:token', confirmar)


//almacena el nuevo password
router.get('/olvide-password/:token', comprobarToken);
router.post('/olvide-password/:token', nuevoPassword);





export default router