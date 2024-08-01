const express = require('express')
const router = express.Router()
const fs = require('fs');
const path = require('path'); 

let usuario

const inicializarTodasPaginas = () => {
    const arquivos = fs.readdirSync(path.join(__dirname, '../views/posts'));
    const paginaNova = arquivos.map((arquivo) => ({ url: arquivo.replace('.mustache', '')}))
    console.log(paginaNova)
    return {

        paginaNova
    
    };
}

const todasPaginas = inicializarTodasPaginas();

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

router.get("/editar", (req, res) => {

    if(!req.session.usuario){

        return res.redirect("/")

    }

    res.render("editar", {usuario: usuario, todasPaginas: todasPaginas})

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

    const { headerColor, footerColor } = req.body;

    const pag = 
    "<!doctype html>" +
    "<html lang='pt-br'>" +
    "<head>" +
    "<meta charset='utf-8'>" +
    "<title>" + req.body.header + "</title>" +
    "<link rel='stylesheet' href='../global.css'></link>" +
    "</head>" +
    `<style>
        header {
            background: ${headerColor};
        }

        footer {
            background: ${footerColor};
        }
    </style>
    ` + 
    "<body>" + 
    "<header>" + 
    "<h1>" + 
    req.body.header + 
    "</h1>" + 
    "</header>"+
    "<main>" +
    req.body.main +
    "</main>" +
    "<footer>" +
    req.body.footer +
    "</footer>" +
    "</body>" +
    "</html>";

    const content = 
    `    URL: ${req.body.url} 
    Cabeçalho: ${req.body.header} 
    Texto principal: ${req.body.main} 
    Rodapé: ${req.body.footer}`

    console.log(req.body)

    if(req.body.url == "" || req.body.header == ""){

        return res.render("home", {aviso: "Preencha todos os dados", usuario: usuario, todasPaginas: todasPaginas})

    }

    else if(todasPaginas.paginaNova.some(pagina => pagina.url == req.body.url)){

        return res.render("home", {aviso: "Essa URL já foi usada antes", usuario: usuario, todasPaginas: todasPaginas})
        
    }

    todasPaginas.paginaNova.push({
        "url": req.body.url,
    });

    // Caminho absoluto para o arquivo

    const filePath = path.join(__dirname, '../views/posts', `${req.body.url}.mustache`);

    const contentPath = path.join(__dirname, '../views/content', `${req.body.url}.txt`);

    // Criando arquivo com o conteúdo da página

    fs.writeFile(filePath, pag, (err) => {

        if (err) {

            console.error("Erro ao criar o arquivo:", err);
            return res.render("home", { aviso: "Erro ao criar página", usuario: usuario, todasPaginas: todasPaginas });
        } else {
            console.log("Página criada com sucesso");
            fs.writeFile(contentPath, content, (err) => {
                if (err) console.log("Erro ao criar o .txt:"+err)
            })
        }
    });

    res.redirect("/home")

})

//A rota que recebe os dados da página a ser excluida, percorrendo o array de páginas para identificar e excluir a rota do array e dos arquivos, verificando se a URL existe e foi preenchida

router.post("/deletar", (req, res) => {

    if(req.body.url == ""){

        return res.render("excluir", {aviso: "Preencha a url", usuario: usuario, todasPaginas: todasPaginas})

    }

    else if(!todasPaginas.paginaNova.some(pagina => pagina.url == req.body.url)){

        return res.render("excluir", {aviso: "Essa URL não foi cadastrada", usuario: usuario, todasPaginas: todasPaginas})
        
    }

    // Caminho absoluto para o arquivo

    const filePath = path.join(__dirname, '../views/posts', `${req.body.url}.mustache`);

    const contentPath = path.join(__dirname, '../views/content', `${req.body.url}.txt`);

    console.log(todasPaginas)

    todasPaginas.paginaNova = todasPaginas.paginaNova.filter(pagina => pagina.url !== req.body.url);

    console.log(todasPaginas)

    // Excluindo arquivo da página escolhida

    fs.unlink(filePath, (err) => {

        if (err) {

            console.error("Erro ao deletar o arquivo:", err);
            return res.render("home", { aviso: "Erro ao deletar página", usuario: usuario, todasPaginas: todasPaginas });
        } else {
            fs.unlink(contentPath, (err) => {
                console.log("Erro ao deletar o .txt: "+err)
            })
            console.log("Página deletada com sucesso");
        }
    });

    res.redirect("/excluir")

})

//A rota que recebe os dados da página a ser editada e os altera tanto no array quanto no arquivo, verificando se os campos foram preenchidos e se a URL existe

router.post("/editar", (req, res) => {

    const newInfo = 
    "<!doctype html>" +
    "<html lang='pt-br'>" +
    "<head>" +
    "<meta charset='utf-8'>" +
    "<title>" + req.body.header + "</title>" +
    "<link rel='stylesheet' href='../global.css'></link>" +
    "</head>" +
    "<body>" + 
    "<header>" + 
    "<h1>" + 
    req.body.header + 
    "</h1>" + 
    "</header>"+
    "<main>" +
    req.body.main +
    "</main>" +
    "<footer>" +
    req.body.footer +
    "</footer>" +
    "</body>" +
    "</html>";

    const newContent = 
    `    URL: ${req.body.url} 
    Cabeçalho: ${req.body.header} 
    Texto principal: ${req.body.main} 
    Rodapé: ${req.body.footer}`

    console.log(req.body)

    if(req.body.url == "" || req.body.header == "" || req.body.main == "" || req.body.footer == ""){

        return res.render("editar", {aviso: "Preencha todos os dados", usuario: usuario, todasPaginas: todasPaginas})

    }

    else if(!todasPaginas.paginaNova.some(pagina => pagina.url == req.body.url)){

        return res.render("editar", {aviso: "Essa URL não foi cadastrada", usuario: usuario, todasPaginas: todasPaginas})
        
    }

    // Caminho absoluto para o arquivo

    const filePath = path.join(__dirname, '../views/posts', `${req.body.url}.mustache`);

    const contentPath = path.join(__dirname, '../views/content', `${req.body.url}.txt`);

    // Percorre o array para identifiar a página a ser alterada e modifica com base nos dados fornecidos

    for(let i = 0; i < todasPaginas.paginaNova.length; i++){

        if(todasPaginas.paginaNova[i].url == req.body.url){

            todasPaginas.paginaNova[i] = { 
                "url": req.body.url,
            };

            fs.writeFile(filePath, newInfo, (err) => {

                if (err) {
                    console.error("Erro ao editar o arquivo:", err);
                    return res.render("editar", { aviso: "Erro ao editar página", usuario: usuario, todasPaginas: todasPaginas });
                } else {
                    console.log("Página editada com sucesso");
                    fs.writeFile(contentPath, newContent, (err) => {
                        console.log("Erro ao editar o .txt: "+err)
                    })
                }

            })

        }

    }

    res.redirect("/editar")

})

// A rota que recebe a URL da página como parâmetro e renderiza o template usando o conteúdo como argumento
router.get("/posts/:url", (req, res) => {

    const filePath = path.join(__dirname, '../views/posts', `${req.params.url}.mustache`);

    console.log(filePath)

    fs.readFile(filePath, 'utf8', (err, data) => {
        console.log(err, data)

        if (err) {
            console.error("Erro ao ler o arquivo:", err);
            return res.status(404).render("404", { aviso: "Página não encontrada", usuario: usuario });
        }

        res.render(`posts/${req.params.url}`, { conteudo: data, usuario: usuario });

    });

});

module.exports = router
