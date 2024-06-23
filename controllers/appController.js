import {Sequelize} from 'sequelize'
import {Precio,Categoria,Propiedad,} from '../models/Index.js'


const inicio = async (req,res) => {

    const [categorias,precios, casas , departamentos] = await Promise.all([
        Categoria.findAll({raw:true}),
        Precio.findAll({raw:true}),
        Propiedad.findAll({
            limit:3,
            where: {
                categoriaId: 1
            },
            include: [
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        }),
        Propiedad.findAll({
            limit:3,
            where: {
                categoriaId: 2
            },
            include: [
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        })

    ])

    res.render('app/inicio',{
        pagina: 'Inicio',
        categorias,
        precios,
        casas,
        departamentos,
        csrfToken: req.csrfToken()
    })
}

const categoria = async (req,res) => {

    const {id} = req.params 
    
    //comprobar categoria exista

    const categoria = await Categoria.findByPk(id)

    if(!categoria){
        return res.redirect('/404')
    }

    //obtener bienes de la categoria

    const propiedades = await Propiedad.findAll({
        where: {
            categoriaId: id
        },
        include:[
            {model: Precio, as: 'precio'},
            {model: Categoria, as: 'categoria'}
        ]
    })

    res.render('app/categoria',{
        pagina: `${categoria.nombre}s en venta`,
        propiedades,
        csrfToken: req.csrfToken()
    })



}

const noEncontrado = (req,res) => {

    res.render('404', {
        pagina:'No encontrada',
        csrfToken: req.csrfToken()
    })

}

const buscador = async (req,res) => {

    const {termino} = req.body

    // validar termino no este vacio 

    if (!termino.trim()){
        res.redirect('back')
    }

    //consultar Propiedades

    const propiedades = await Propiedad.findAll({
        where: {
            titulo:{
                [Sequelize.Op.like]: '%' + termino + '%'
            },
        },
        include:[
            {model:Precio, as: 'precio'},
            {model:Categoria, as: 'categoria'}
        ]
    })

    res.render('app/busqueda',{
        pagina: `Resultados de: ${termino}`,
        propiedades,
        csrfToken: req.csrfToken()
    })

}

export {
    inicio,
    categoria,
    noEncontrado,
    buscador
}