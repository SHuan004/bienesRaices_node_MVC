import { DataTypes } from "sequelize";
import db from '../config/db.js'
import bcrypt from 'bcrypt'

const Precio = db.define('precios',{

    nombre:{
        type: DataTypes.STRING(100),
        allowNull: false
    }

})

export default Precio