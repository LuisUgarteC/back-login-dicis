const router = require('express').Router()
const User = require('../models/User')
const Joi = require ('@hapi/joi')
const bcrypt = require('bcrypt')
const Jwt = require('jsonwebtoken')
const { exist } = require('@hapi/joi')

const validacionRegistro = Joi.object({   //esquema para hacer validacion 
    name: Joi.string().max(255).required(),
    apaterno: Joi.string().max(255).required(),
    amaterno: Joi.string().max(255).required(),
    email: Joi.string().max(255).required(),
    password: Joi.string().min(6).max(1024).required()
})

const validacionLogin = Joi.object({   //esquema para hacer validacion 
    email: Joi.string().max(255).required(),
    password: Joi.string().min(6).max(1024).required()
})

const validacionUpdate = Joi.object({  
    id: Joi.string().max(1024).required(),
    name: Joi.string().max(255).required(),
    apaterno: Joi.string().max(255).required(),
    amaterno: Joi.string().max(255).required(),
    password: Joi.string().min(6).max(1024).required()
})

router.post('/register', async(req, res) => {     //async tiene que esperar hasta que se pueda ejecutar 
    const { error } = validacionRegistro.validate(req.body)

    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        })
    }

    const existeCorreo = await User.findOne({
        email: req.body.email
    })

    if (existeCorreo) {
        return res.status(400).json({
            error: "El correo ya existe"
        })
    }

    const salt = await bcrypt.genSalt(10) //encriptacion
    const constrasenaNueva = await bcrypt.hash(req.body.password, salt)

    const usuario = new User({
        name: req.body.name,
        apaterno: req.body.apaterno, 
        amaterno: req.body.amaterno,
        email: req.body.email,
        password: constrasenaNueva //generamos la nueva contraseña
    })
    try {
        const guardado = await usuario.save()
        if(guardado){
            return res.json({
                error: null,
                data: guardado
            })
        } else {
            return res.json({
                error: "No se pudo guardar :c"
            })
        }
    }catch (error){
        return res.json({
            error
        })
    }
}) 

router.post('/login', async(req, res) =>{
    const { error } = validacionLogin.validate(req.body)

    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        })
    }

    const existeCorreo = await User.findOne({
        email: req.body.email
    })

    if (!existeCorreo) {
        return res.status(400).json({
            error: "Correo no encontrado"
        })
    }

    const passwordCorrecto = await bcrypt.compare(req.body.password, existeCorreo.password)

    if (!passwordCorrecto) {
        return res.status(400).json({
            error: "Las constraseñas no coinciden"
        })
    }

    const token = Jwt.sign({
        name: existeCorreo.name,
        id: existeCorreo._id
    }, process.env.TOKEN_SECRET)

    res.header('auth-token', token).json({
        error: null,
        data: {token}
    })
})

router.get('/getallusers', async(req, res) => {
    const users = await User.find()
    if (users){
        res.json({
            error: null,
            data: users
        })
    } else {
        res.json({
            error: "No hay usuarios en la DB"
        })
    }
})

router.post('/deleteuser', async(req, res) => {
    const id = req.body.id
    const userExist = await User.findById({_id: id})
    if(userExist) {
        await User.findByIdAndDelete({_id: id})
        res.json({
            error: null,
            data: 'Usuario Borrado'
        })
    } else {
        res.json({
            error: "Ususario no encontrado"
        })
    }
})

router.post('/updateuser', async(req, res) => {     //async tiene que esperar hasta que se pueda ejecutar 
    const { error } = validacionUpdate.validate(req.body)

    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        })
    }
   let existeId = await User.findOne({
        _id: req.body.id
    })

    if (!existeId) {
        return res.status(400).json({
            error: "El usuario no existe"
        })
    }

    const salt = await bcrypt.genSalt(10) //encriptacion
    const constrasenaNueva = await bcrypt.hash(req.body.password, salt)
    existeId = {
        id: req.body.id,
        name: req.body.name,
        apaterno: req.body.apaterno,
        amaterno: req.body.amaterno,
        password: constrasenaNueva
    }
    try {
        const guardado = await User.findByIdAndUpdate(
            {_id: existeId.id},
            existeId,
            { new: true }
        )
        if(guardado){
            return res.json({
                error: null,
                data: guardado
            })
        } else {
            return res.json({
                error: "No se pudo guardar :c"
            })
        }
    }catch (error){
        return res.json({
            error
        })
    }
}) 

module.exports = router //Cualquier otro archivo va reconocerlo como router