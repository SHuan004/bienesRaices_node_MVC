
import {Precio,Categoria, Propiedad,Mensaje, Usuario} from "../models/Index.js"
import {validationResult} from 'express-validator'
import {unlink} from 'node:fs/promises'
import {esVendedor, formatearFecha} from '../helpers/index.js'


const admin = async (req,res) => {

    //leer quetyString

    const {pagina: paginaActual} = req.query

    const expresionReg = /^[1-9]$/
    if(!expresionReg.test(paginaActual)){
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try {

        const {id} = req.usuario

        const limit = 10
        const offset = ((paginaActual * limit ) - limit )

        const [propiedades,total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
    
                where: {   
                    usuarioId: id
                },
                include:[
                    {model: Categoria,as: 'categoria'
                    },
                    {
                        model: Precio, as: 'precio'
                    },
                    {
                        model: Mensaje, as: 'mensajes'
                    }
                ]
            }),
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
       
        ])

       
    
        res.render('propiedades/admin',{
            pagina: 'Mis Propiedades',
            csrfToken: req.csrfToken(),
            propiedades,
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            offset,
            limit,
            total
        })
        
    } catch (error) {
        console.log(error)
    }


}

const crear = async (req,res) => {

    //Consultar Modelo de Precio y Categoria 
    const [precios,categorias,] = await Promise.all([
        Precio.findAll(),
        Categoria.findAll()
    ])

    res.render('propiedades/crear',{
        pagina: 'Crear Propiedades',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {

        }
        
    })
}

const guardar = async (req,res) => {


    //validacion
    let resultado = validationResult(req)
  

    if(!resultado.isEmpty()){

        const [precios,categorias,] = await Promise.all([
            Precio.findAll(),
            Categoria.findAll()
        ])

        return    res.render('propiedades/crear',{
            pagina: 'Crear Propiedades',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
            
        })
    }

    //Crear registro
    const {titulo,descripcion,habitaciones,estacionamiento,wc,calle,lat,lng,precio: precioId,categoria: categoriaId, } = req.body

    console.log(req.usuario.id)

    const {id: usuarioId} = req.usuario

    try {
        const propiedadGuardada= await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ""


        })

        const {id} = propiedadGuardada

        res.redirect(`/propiedades/agregar-imagen/${id}`)
    } catch (error) {
        console.log(error)

    }
}

const agregarImagen = async (req,res) => {

    const {id} = req.params;
    //validar
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mis-propiedades');
    };


    //propiedad no publicada

    if(propiedad.publicado){
        return res.redirect('/mis-propiedades');
    };


    //propuedad de usuario 

    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades');

    }

    res.render('propiedades/agregar-imagen',{
        pagina: `Agregar Image: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad,
        

    })
}


const almacenarImagen = async (req,res,next) => {

    const {id} = req.params;
  
    //validar
    const propiedad = await Propiedad.findByPk(id);
 

    if(!propiedad){
        return res.redirect('/mis-propiedades');
    };


    //propiedad no publicada

    if(propiedad.publicado){
        return res.redirect('/mis-propiedades');
    };


    //propuedad de usuario 

    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades');

    }

    try {
        
        //almacenar la imagen y publicar la propiedad
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1

        await propiedad.save()
        next()

       
        
    } catch (error) {
        console.log(error)
    }

}

const editar = async (req,res) => {

    const {id} = req.params
    //validar propiedad existe 
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //quien visitra es dueño de la propiedad

    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //Consultar Modelo de Precio y Categoria 
    const [precios,categorias,] = await Promise.all([
        Precio.findAll(),
        Categoria.findAll()
    ])

    res.render('propiedades/editar',{
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
        
    })
}

const guardarCambios = async (req,res) => {

      //validacion
      let resultado = validationResult(req)
  

      if(!resultado.isEmpty()){
  
          const [precios,categorias,] = await Promise.all([
              Precio.findAll(),
              Categoria.findAll()
          ])

          return res.render('propiedades/editar',{
            pagina: `Editar Propiedad: ${req.body.titulo}`,
            csrfToken: req.csrfToken(),
            categorias,
            errores: resultado.array(),
            precios,
            datos: req.body
            
         })
      }

    const {id} = req.params
    //validar propiedad existe 
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //quien visitra es dueño de la propiedad

    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }


    //actualizar 

    try {

        //Crear registro
        const {titulo,descripcion,habitaciones,estacionamiento,wc,calle,lat,lng,precio: precioId,categoria: categoriaId, } = req.body

        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        })

        await propiedad.save()

        res.redirect('/mis-propiedades')

    } catch (error) {

        console.log(error)
        
    }



}

const eliminar = async (req,res) => {

   
    const {id} = req.params
    //validar propiedad existe 
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //quien visitra es dueño de la propiedad

    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    // ELIMINAR imagen
    if(propiedad.imagen !== ''){
        await unlink(`public/uploads/${propiedad.imagen}`)
    }

    //eliminar 

    await propiedad.destroy()
    res.redirect('/mis-propiedades')

}

//modifica estado de la propiedad

const cambiarEstado = async (req,res) => {

    const {id} = req.params
    //validar propiedad existe 
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //quien visitra es dueño de la propiedad

    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //Actualizar

    propiedad.publicado = !propiedad.publicado

    await propiedad.save()

    res.json({
        resultado: true
    })
}




//Muestra una Propiedad 

const mostrarPropiedad = async(req,res) => {

    const {id} = req.params


    //validar

    const propiedad = await Propiedad.findByPk(id, {
        include:[
            {
            model: Categoria,as: 'categoria'
            },
            {
            model: Precio, as: 'precio'
            }
        ]
    })
    if(!propiedad || !propiedad.publicado){
        return res.redirect('/404')
    }


    res.render('propiedades/mostrar',{
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id,propiedad.usuarioId)
        
    })

}

const enviarMensaje = async (req,res) => {

    const {id} = req.params


    //validar

    const propiedad = await Propiedad.findByPk(id, {
        include:[
            {
            model: Categoria,as: 'categoria'
            },
            {
            model: Precio, as: 'precio'
            }
        ]
    })
    if(!propiedad){
        return res.redirect('/404')
    }

    //Renderizar errores

    let resultado = validationResult(req)
  

    if(!resultado.isEmpty()){
   
        return res.render('propiedades/mostrar',{
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVenderos: esVendedor(req.usuario?.id,propiedad.usuarioId),
            errores: resultado.array()
                
        })
    }

    //Guardar Mensaje
    const {mensaje} = req.body
    const {id: propiedadId} = req.params
    const {id: usuarioId} = req.usuario

    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    res.redirect('/')



}

// Leer Mensajes recibidos

const verMensajes = async (req,res) => {

    const {id} = req.params
    //validar propiedad existe 
    const propiedad = await Propiedad.findByPk(id,{
        
        include:[
            {
            model: Mensaje, as: 'mensajes',
            include: [
                {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
            ]
            }
            
        ]
    })

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //quien visitra es dueño de la propiedad

    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/mensajes',{
        pagina:'Mensajes',
        mensajes:propiedad.mensajes,
        formatearFecha
    })
}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes,
    cambiarEstado
}