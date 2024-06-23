import express from 'express'
import csurf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import db from './config/db.js'

//crear app

const app = express()

//Habilitar lectura formularios

app.use(express.urlencoded({extended:true}))

//habilitar cookie parser
app.use(cookieParser())

//habilitar CSRF
app.use(csurf({cookie: true}))

//conexion db

try {
  await db.authenticate()
  db.sync()
  console.log('conexion exitosa')
} catch (error) {
  console.log(error)
}
  
//pug
app.set('view engine', 'pug')
app.set('views', './views')

//carpeta Publica

app.use(express.static('public'))

//Routing
app.use('/',appRoutes)
app.use('/auth',usuarioRoutes)
app.use('/',propiedadesRoutes)
app.use('/api',apiRoutes)

// Definir Puerto
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('El servidor esta corriendo en el puerto 3000')
});