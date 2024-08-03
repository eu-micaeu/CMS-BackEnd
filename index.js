//Requires gerais
const path = require("path")
require("dotenv").config()

//Express
const express = require('express')
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')))

//Nocache
const nocache = require('nocache');
app.use(nocache())

//Template
var mustacheExpress = require("mustache-express");
var engine = mustacheExpress()
app.engine("mustache", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "mustache");
app.set('view cache', false);

//Cookies
const cookieParser = require("cookie-parser")
app.use(cookieParser())

//Sessão
const session = require("express-session")
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use("/", require('./controls/main'))

app.listen(process.env.PORT, () => {
    console.log("Running...")
})