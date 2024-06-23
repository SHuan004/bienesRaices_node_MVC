import {exit} from 'node:process'
import categorias from "./categoria.js";
import precios from "./precio.js";
import usuarios from './usuario.js';
import {Categoria,Precio,Propiedad,Usuario} from '../models/Index.js'
import db from "../config/db.js";


const importarDatos = async () => {
    try {

        //Autenticar

        await db.authenticate()

        //Generar Columnas

        await db.sync()


        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])

        console.log('Datos importados correctamente')
        exit(0)
        
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

const eliminarDatos = async() =>{
    try {

        await db.sync({force:true})

        console.log('Datos Eliminados correctamente')
        exit(0)
        
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

if(process.argv[2] === "-i"){
    importarDatos();
}


if(process.argv[2] === "-e"){
    eliminarDatos();
}