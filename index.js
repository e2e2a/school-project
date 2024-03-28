require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
var path = require('path')

const database = require('./core/database');
const session = require('./core/session');

const flash = require('express-flash');
const app = express();
app.use(session());
app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/public/admin', express.static(path.join(__dirname, 'public/admin')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'));
app.use(flash());
app.use(function (req, res, next) {
    req.db = database();
    next();
});
require('./routes/web')(app);
const PORT = process.env.PORT
app.listen(PORT, async () => {
    console.log("Server is running at port", PORT);
});