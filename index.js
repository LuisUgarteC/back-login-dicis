const express = require('express')
const mongoose = require ('mongoose')
const bodyParcer = require('body-parser')
require('dotenv').config()

const app = express()

//Capturar el body 
app.use(bodyParcer.urlencoded({
    extended: false
}))
app.use(bodyParcer.json())

//Conexión a la base de datos
const url = `mongodb+srv://admin:123@cluster0.me4njnf.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`
mongoose.connect(url, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(()=> console.log('Conectado a la base de datos'))
.catch((error) => console.log('ERROR: ' + error))

//Creación e importación de rutas 
const authRoutes = require('./routes/auth') //todo lo que esta en este archivo se pasa a la constante de identificacion de rutas

//Ruta del middleware 
app.use('/api/user', authRoutes)

app.get('/', (req, res) => {
    res.json({
        estado: true,
        mensaje: 'funcionanding correctly'
    })
})

//Iniciamos el servidor 
const PORT = process.env.PORT || 10000 //if en js, SI NO EXISTE LA VARIABLE UTILIZA EL PUERTO 10000
app.listen(PORT, () => {
    console.log(`Servidor en Puerto: ${PORT}`)  
})