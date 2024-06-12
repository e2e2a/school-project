require('dotenv').config();
const express = require('express');
const session = require('express-session');
// const MongoDBSessionStore = require('connect-mongodb-session')(session);
const bodyparser = require('body-parser');
var path = require('path');
const dbConnect = require('./database/dbConnect');
const flash = require('express-flash');
const app = express();
const conn = dbConnect();
const User = require('./models/user');
const port = process.env.PORT || 8081;
// const store = new MongoDBSessionStore({
//     uri: process.env.MONGODB_CONNECT_URI,
//     collection: 'sessions'
// });

app.use(session({
    secret: 'sessionsecret777',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    resave: false,
    saveUninitialized: true,
    // store: store,
}));

app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/public/admin', express.static(path.join(__dirname, 'public/admin')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'));
app.use(flash());
app.use(function (req, res, next) {
    req.db = conn;
    next();
});
require('./routes/web')(app);
app.use((req, res, next) => {
    if (!req.session.login) {
        return res.redirect('/');
    }
    next();
});

app.use(async (req, res, next) => {
    const user = await User.findById(req.session.login)
    return res.status(404).render('404', {
        role: user.role,
    });
});

app.listen(port, async () => {
    console.log("Server is running at port", PORT);
});