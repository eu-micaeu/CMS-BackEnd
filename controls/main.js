const express = require('express')
const router = express.Router()
const fs = require('fs');
const path = require('path'); 

let usuario

const todasPaginas = {
    paginaNova: []
};

todasPaginas.paginaNova.push({"url": "teste", "conteudo": "Olá! Bem-vindo ao sistema de criação de páginas."})

// Páginas

router.get("/", (req, res) => {

    res.render("index", {todasPaginas: todasPaginas})
})

router.get("/home", (req, res) => {

    if(!req.session.usuario){

        return res.redirect("/")

    }

    res.render("home", {usuario: usuario, todasPaginas: todasPaginas})

})

router.get("/excluir", (req, res) => {

    if(!req.session.usuario){

        return res.redirect("/")

    }

    res.render("excluir", {usuario: usuario, todasPaginas: todasPaginas})

})

//

// Funções

// Para controle de autenticação do usuário deve ser utilizado sessão
router.post("/login", (req, res) => {

    if(req.body.usuario != process.env.USUARIO || req.body.senha != process.env.SENHA){

        res.render("index", {aviso: "Usuário não encontrado", todasPaginas: todasPaginas})

        req.session.destroy()

    }else{

        usuario = req.body.usuario

        req.session.usuario = usuario

        res.redirect("/home")

    }

})

// O sistema deve também incluir uma rota para logout
router.post("/logout", (req, res) => {

    req.session.destroy()

    res.redirect("/")

})

//A rota que recebe os dados da nova página e os armazena em um objeto que guarda todas as páginas, verificando se os campos foram preenchidos e se a URL é repetida
router.post("/criar", (req, res) => {

    if(req.body.url == "" || req.body.conteudo == ""){

        return res.render("home", {aviso: "Preencha todos os dados", usuario: usuario, todasPaginas: todasPaginas})

    }

    else if(todasPaginas.paginaNova.some(pagina => pagina.url == req.body.url)){

        return res.render("home", {aviso: "Essa URL já foi usada antes", usuario: usuario, todasPaginas: todasPaginas})
        
    }

    console.log(todasPaginas)

    todasPaginas.paginaNova.push({"url": req.body.url, "conteudo": req.body.conteudo});

    console.log(todasPaginas)

    // Caminho absoluto para o arquivo

    const filePath = path.join(__dirname, '../views', `${req.body.url}.mustache`);

    // Criando arquivo com o conteúdo da página

    fs.writeFile(filePath, req.body.conteudo, (err) => {

        if (err) {

            console.error("Erro ao criar o arquivo:", err);
            return res.render("home", { aviso: "Erro ao criar página", usuario: usuario, todasPaginas: todasPaginas });
        } else {
            console.log("Página criada com sucesso");
        }
    });

    res.render("home", {usuario: usuario, todasPaginas: todasPaginas})

})

router.post("/deletar", (req, res) => {

    if(req.body.url == ""){

        return res.render("excluir", {aviso: "Preencha a url", usuario: usuario, todasPaginas: todasPaginas})

    }

    else if(!todasPaginas.paginaNova.some(pagina => pagina.url == req.body.url)){

        return res.render("excluir", {aviso: "Essa URL não foi cadastrada", usuario: usuario, todasPaginas: todasPaginas})
        
    }

    // Caminho absoluto para o arquivo

    const filePath = path.join(__dirname, '../views', `${req.body.url}.mustache`);

    console.log(todasPaginas)

    todasPaginas.paginaNova = todasPaginas.paginaNova.filter(pagina => pagina.url !== req.body.url);

    console.log(todasPaginas)

    // Criando arquivo com o conteúdo da página

    fs.unlink(filePath, (err) => {

        if (err) {

            console.error("Erro ao deletar o arquivo:", err);
            return res.render("home", { aviso: "Erro ao deletar página", usuario: usuario, todasPaginas: todasPaginas });
        } else {
            console.log("Página deletada com sucesso");
        }
    });

    res.render("excluir", {usuario: usuario, todasPaginas: todasPaginas})

})

// A rota que recebe a URL da página como parâmetro e renderiza o template usando o conteúdo como argumento
router.get("/:url", (req, res) => {

    const filePath = path.join(__dirname, '../views', `${req.params.url}.mustache`);

    fs.readFile(filePath, 'utf8', (err, data) => {

        if (err) {
            console.error("Erro ao ler o arquivo:", err);
            return res.status(404).render("404", { aviso: "Página não encontrada", usuario: usuario });
        }

        res.render(req.params.url, { conteudo: data, usuario: usuario });
    });
});

module.exports = router

/*

colocar a restrição de conteudo vazio e repetido no input

fazer as páginas serem exibidas uma do lado da outra ao invés de em baixo

tornar o link clicável

fazer com que uma página seja criada corretamente com base no conteudo -> criar um tempate mustache vazio que é preenchido com o conteudo

*/