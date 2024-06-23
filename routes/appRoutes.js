import express from 'express'
import {inicio,categoria,noEncontrado,buscador} from '../controllers/appController.js'

const router = express.Router()


//pagina Inicio

router.get('/', inicio)


//categoria
router.get('/categorias/:id', categoria)

//Pagina 404

router.get('/404', noEncontrado)
//buscador

router.post('/buscador', buscador)

export default router;









