const express = require('express')
const router = express.Router()

let usuario
const todasPaginas = {
    paginaNova: []
};

router.get("/", (req, res) => {

    res.render("index", {todasPaginas: todasPaginas})
})

// Para controle de autenticação do usuário deve ser utilizado sessão
router.post("/login", (req, res) => {

    if(req.body.usuario != process.env.USUARIO || req.body.senha != process.env.SENHA){

        res.render("index", {aviso: "Usuário não encontrado", todasPaginas: todasPaginas})

        req.session.destroy()

    }else{

        usuario = req.body.usuario

        return res.render("home", { usuario: usuario, todasPaginas: todasPaginas } )

    }

})

// O sistema deve também incluir uma rota para logout
router.post("/logout", (req, res) => {

    req.session.destroy()

    return res.render("index", {aviso: "Usuário deslogado", todasPaginas: todasPaginas})

})

//A rota que recebe os dados da nova página e os armazena em um objeto que guarda todas as páginas, verificando se os campos foram preenchidos e se a URL é repetida
router.post("/criar", (req, res) => {

    if(req.body.url == "" || req.body.conteudo == ""){

        return res.render("home", {aviso: "Preencha todos os dados", usuario: usuario, todasPaginas: todasPaginas})
    }
    else if(todasPaginas.paginaNova.some(pagina => pagina.url == req.body.url)){
        return res.render("home", {aviso: "Essa URL já foi usada antes", usuario: usuario, todasPaginas: todasPaginas})
    }

    todasPaginas.paginaNova.push({"url": req.body.url, "conteudo": req.body.conteudo});

    return res.render("home", { usuario: usuario, todasPaginas: todasPaginas });
})

//A rota que recebe a url da página como parâmetro e renderiza o template usando o conteudo como argumento
router.post("/:url", (req, res) => {

})

module.exports = router

/*

colocar a restrição de conteudo vazio e repetido no input

fazer as páginas serem exibidas uma do lado da outra ao invés de em baixo

tornar o link clicável

fazer com que uma página seja criada corretamente com base no conteudo -> criar um tempate mustache vazio que é preenchido com o conteudo

*/