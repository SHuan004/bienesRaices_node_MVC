import {check,validationResult} from 'express-validator'
import Usuario from "../models/Usuario.js"
import bcrypt from 'bcrypt'

import {generarId,generarJWT} from '../helpers/tokens.js'
import {emailRegistro, emailOlvideRecuperacion} from '../helpers/emails.js'


const formularioLogin = (req,res) => {
    res.render('auth/login',{
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    })
}
const iniciarSesion = async (req,res) => {
    
    await check('email').isEmail().withMessage('El email es obligatorio').run(req);
    await check('password').notEmpty().withMessage('la contraseña es obligatoria').run(req);

    let resultado = validationResult(req)
    
    const {email,password} = req.body

    if(!resultado.isEmpty()){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario:{
                email: email,
            }
        })
    }

    //Comprobar si existe

    const usuario = await Usuario.findOne({where: {email}})
    if(!usuario){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores:[{msg: "El usuario no existe"}],

        })
    }
    //Revisar conmfirmacion usuario
    if(!usuario.confirmado){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores:[{msg: "Tu cuenta no ha sido confirmada"}],
            usuario:{
                email: email,
            }

        })
    }
    //Revisar password
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores:[{msg: "Contraseña incorrecta"}],
            usuario:{
                email: email,
            }

        })
    }

    //Authenticar Usuario
    const token = generarJWT({id: usuario.id,nombre: usuario.nombre})
    console.log(token);

    //almacenar cokies
   return res.cookie("_token", token,{
        httpOnly: true,
        //secure: true
    }).redirect('/mis-propiedades')
    
}

//cerrar sesion

const cerrarSesion = async (req,res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

const formularioRegistro = (req,res) => {
    
    res.render('auth/registro',{
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req,res) => {
    //validaciones
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req);
    await check('email').isEmail().withMessage('Eso no parece un Email').run(req);
    await check('password').isLength({min: 6}).withMessage('El password debe superar los 6 caracteres').run(req);
    await check('repetir_password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Las contraseñas no son iguales')
    .run(req);

    let resultado = validationResult(req)
    
    const {nombre,email,password} = req.body

    if(!resultado.isEmpty()){
        return res.render('auth/registro',{
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario:{
                nombre: nombre,
                email: email,
            }
        })
    }

    //Verificar existe
    const existeUsuario = await Usuario.findOne({where: { email : email }})
    if(existeUsuario){
        return res.render('auth/registro',{
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario ya esta registrado'}],
            usuario:{
                nombre: nombre,
                email: email,
            }
        })
    }

    //Almacenar
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    //Enviar Mensaje de Confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    res.render('templates/mensaje',{
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos Enviado un Email de Confirmacion, presiona en el enlace',
    })


}


//funcion que comprueba una cuenta

const confirmar = async (req,res) =>{
    const { token } = req.params
    
    const usuario = await Usuario.findOne({where: {token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            csrfToken: req.csrfToken(),
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    //Confirmar
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    return res.render('auth/confirmar-cuenta',{
        csrfToken: req.csrfToken(),
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta se confirmo correctamente'
       
    })
}

const formularioOlvidePassword = (req,res) => {
    console.log('llega|')
    res.render('auth/olvide-password',{
        pagina: 'Recupera tu acceso a Bienes Raices',
        csrfToken: req.csrfToken(),
    })
}

const reiniciarPassword = async (req,res) => {
    
    await check('email').isEmail().withMessage('Eso no parece un Email').run(req);


    let resultado = validationResult(req)
    
    const {email} = req.body
    console.log('llega|')

    if(!resultado.isEmpty()){
        return res.render('auth/olvide-password',{
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    console.log('llega2')
    //Verificar existe
    const existeUsuario = await Usuario.findOne({where: { email }})

    if(!existeUsuario){
        return res.render('auth/olvide-password',{
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{msg: "El email no pertenece a ningun usuario no"}]
        })
    }

    //generar token y enviar email
    existeUsuario.token = generarId();
    await existeUsuario.save();

    //enviar Email

    emailOlvideRecuperacion({
        email: existeUsuario.email,
        nombre: existeUsuario.nombre,
        token: existeUsuario.token
    })

    //renderisar nueva vista 
    res.render('templates/mensaje',{
        pagina: 'Restablece Contraseña',
        mensaje: 'Hemos Enviado un Email con los pasos a seguir',
    })

}

const comprobarToken = async (req,res) => {
    const {token} = req.params
    const usuario = await Usuario.findOne({where: {token}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Restablece Tu Pasword',
            csrfToken: req.csrfToken(),
            mensaje: 'Hubo un error al validar tu informacion',
            error: true
        })
    }

    // Mostrar formulario nuevo password
    res.render('auth/reiniciar-password',{
        pagina: 'Restablece tu Password',
        csrfToken: req.csrfToken()
    })

    
}

const  nuevoPassword = async (req,res) =>{
    console.log('entra')

    await check('password').isLength({min: 6}).withMessage('El password debe superar los 6 caracteres').run(req);
    await check('repetir_password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Las contraseñas no son iguales')
    .run(req);

    let resultado = validationResult(req)
    const {token} = req.params
    const {password} = req.body

    if(!resultado.isEmpty()){
        return res.render('auth/reiniciar-password',{
            pagina: 'Restablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),

        })
    }

    const usuario = await Usuario.findOne({where: {token}})

    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    usuario.token = null
    await usuario.save()

    res.render('auth/confirmar-cuenta',{
        pagina: 'Password Restablecido',
        mensaje: 'El password de cambio correctamente'
    })

}




export {
    formularioLogin,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    reiniciarPassword,
    nuevoPassword,
    comprobarToken,
    iniciarSesion,
    cerrarSesion
}