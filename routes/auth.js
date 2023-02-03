const router = require('express').Router()
const User = require('../models/User')
const Joi = require ('@hapi/joi')
const bcrypt = require('bcrypt')
const Jwt = require('jsonwebtoken')

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



module.exports = router //Cualquier otro archivo va reconocerlo como router