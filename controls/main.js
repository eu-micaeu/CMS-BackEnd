const e = require('express')
const express = require('express')
const router = express.Router()
const fs = require('fs').promises

router.get("/", (req, res) => {

    lets = {
        aviso: "?",
        conteudo: "Sem conteúdo"
    }

    res.render("index", {aviso: lets.aviso, conteudo: lets.conteudo})
})

// Para controle de autenticação do usuário deve ser utilizado sessão
router.post("/login", (req, res) => {

    if(req.body.nome != process.env.USUARIO){

        aviso = "Usuário não encontrado"

        res.render("index", {aviso: aviso})

        req.session.destroy()

    }else{

        aviso = "Usuário encontrado"

        req.session.usuario = req.body.nome

        res.render("index", {aviso: aviso})

    }

})

// O sistema deve também incluir uma rota para logout
router.post("/logout", (req, res) => {

    req.session.destroy()

    aviso = "Usuário deslogado"

    return res.render("index", {aviso: aviso})
})

// Para criar uma página é necessário estar logado
// O usuário deve especificar a URL e o conteúdo desejado (o conteúdo pode ter marcação HTML ou permitir outra linguagem de estilização como o Markdown)

router.post("/pagina", async (req, res) => {
    try {

        if (req.session.usuario) {

            if (!req.body.conteudo) {
                return res.status(400).send("Conteúdo é obrigatório.");
            }

            // Escreve o conteúdo fornecido no arquivo
            await fs.writeFile("./paginas/conteudo.txt", req.body.conteudo);

            // Lê o conteúdo do arquivo
            const conteudo = await fs.readFile("./paginas/conteudo.txt", "utf8");

            // Renderiza a página com o conteúdo lido e aviso de sucesso
            res.render("index", { conteudo: conteudo, aviso: "Usuário encontrado" });

        } else {

            const conteudo = "Sem conteúdo";

            const aviso = "Usuário não encontrado";

            res.render("index", { conteudo: conteudo, aviso: aviso });

        }
    } catch (error) {

        console.error("Erro ao criar página:", error);

        res.status(500).send("Erro ao criar página. Por favor, tente novamente mais tarde.");

    }

});


module.exports = router