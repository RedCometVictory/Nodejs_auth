require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const cookieSession = require('cookie-session')
const port = 1000
const app = express()
require('./passport-setup')

app.set("view engine", "ejs")

app.use(express.json())
app.use(cookieParser())
app.use('/', require('./routes/authServer'))
app.use('/posts', require('./routes/posts'))

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))

app.use(passport.initialize())
app.use(passport.session())

const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

app.get('/failed', (req, res) => res.send('You failed to login'))

app.get('/success', (req, res) => {
    console.log(req.user)
    res.render('pages/profile.ejs', {name: req.user.displayName, email: req.user.emails[0].value, pic: req.user.photos[0].value})
})

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/google/callback', passport.authenticate('google', {failureRedirect: '/failed'}), 
    function (req, res) {
        res.redirect('/success')
    }
)

app.get('/', (req, res) => res.render("pages/index"))

app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

app.listen(port, () => console.log(`port ${port} is Up`))