import bcrypt from 'bcrypt'
const usuarios = [
    {
        nombre: 'sebastian',
        email: 'seba@seba.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    }
]

export default usuarios