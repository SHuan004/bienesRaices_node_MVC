import { DataTypes } from "sequelize";
import db from '../config/db.js'
import bcrypt from 'bcrypt'

const Usuario = db.define('usuarios',{
    nombre:{
        type: DataTypes.STRING(60),
        allowNull: false

    },
    email: {
        type: DataTypes.STRING(60),
        allowNull: false

    },
    password:{
        type: DataTypes.STRING(60),
        allowNull: false

    },
    token:{
        type: DataTypes.STRING
    },
    confirmado: DataTypes.BOOLEAN

},{
    hooks: {
        beforeCreate: async function(usuario) {
            const salt = await bcrypt.genSalt(10)
            usuario.password = await bcrypt.hash(usuario.password, salt)
        }
    },
    scopes: {
        eliminarPassword:{
            attributes:{
                exclude:['password','token','confirmado','createdAt','updatedAt']
            }
        }
    }

}
)

//Metodo Personalizados

Usuario.prototype.verificarPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

export default Usuario