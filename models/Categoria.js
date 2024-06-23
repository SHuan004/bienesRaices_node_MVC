import { DataTypes } from "sequelize";
import db from '../config/db.js'
import bcrypt from 'bcrypt'

const Categoria = db.define('categorias',{

    nombre:{
        type: DataTypes.STRING(30),
        allowNull: false
    }

})

export default Categoria