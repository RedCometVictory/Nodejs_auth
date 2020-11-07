const router = require('express').Router()
const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const verifyUser = require('../verification');
const dataRoute = 'C:/Users/97250/Desktop/my-Project/nodejs-auth/data'


router.post('/login', (req, res) => {
    const {username, password} = req.body
    fs.readFile(`${dataRoute}/users.json`, 'utf8', async (err, users) => {
        if (err) return res.sendStatus(500)
        users = JSON.parse(users)
        const user = users.find(user => user.name == username)
        if (!user) return res.send("User name doesn't exists")
        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.send("password isn't correct")
        delete user.password

        const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        const refresh_token = jwt.sign({id: user.id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '100d' })
        res.cookie('refresh-token', refresh_token, {
            httpOnly: true,
            secure: false,
            maxAge: 9000000
        })
        res.json({token: access_token})
    })
})

router.post('/register', (req, res) => {
    const {username, password} = req.body
    fs.readFile(`${dataRoute}/users.json`, 'utf8', async (err, users) => {
        if (err) return res.sendStatus(500)
        users = await JSON.parse(users)
        const user = users.find(user => user.name == username)
        console.log(user)
        if (user) return res.status(400).send('Username Exists')
        try {
            const salt = await bcrypt.genSalt()
            const hashedPassword = await bcrypt.hash(password, salt)
            const newUser = {id: uuid.v4(), name: username, password: hashedPassword}
            users.push(newUser)
            fs.writeFile(`${dataRoute}/users.json`, JSON.stringify(users), err => {
                if (err) return res.sendStatus(500)
                res.sendStatus(201)
            } )
        } catch {
            res.sendStatus(500)
        }
    })
})

router.get('/refresh', (req, res) => {
    fs.readFile(`${dataRoute}/users.json`, 'utf8', (err, users) => {
        if (err) return res.sendStatus(500)
        users = JSON.parse(users)
        jwt.verify(req.cookies['refresh-token'], process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
            if (err) return res.status(401).send('Bad refresh token')
            const user = users.find(user => user.id == payload.id)
            if (!user) return res.status(401)
            delete user.password
            const access_token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
            res.status(200).json({access_token})
        })
        
    })    
})

router.delete('/logout', verifyUser, (req, res) => {
    res.clearCookie('refresh-token')
    res.send('You logout')
})

module.exports = router