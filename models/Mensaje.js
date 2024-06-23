import { DataTypes } from "sequelize";
import db from '../config/db.js'
import bcrypt from 'bcrypt'

const Mensaje = db.define('mensajes',{

    mensaje:{
        type: DataTypes.STRING(300),
        allowNull: false
    }

})


export default Mensaje