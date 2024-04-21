const express = require('express')
const router = express.Router()

router.get("/", (req, res) => {

    res.render("index")
})

router.get("/login", (req, res) => {

    res.render("login")
})

// Para controle de autenticação do usuário deve ser utilizado sessão
router.post("/login", (req, res) => {

    if(req.body.usuario != process.env.USUARIO || req.body.senha != process.env.SENHA){

        aviso = "Usuário não encontrado"

        res.render("login", {aviso: aviso})

        req.session.destroy()

        alert("Usuário não encontrado")

    }else{

        aviso = "Usuário encontrado"

        req.session.usuario = req.body.usuario

        res.render("login", {aviso: aviso})

        alert("Usuário encontrado")

    }

})

// O sistema deve também incluir uma rota para logout
router.post("/logout", (req, res) => {

    req.session.destroy()

    aviso = "Usuário deslogado"

    return res.render("index", {aviso: aviso})

})

module.exports = router