const jwt = require('jsonwebtoken')

const verifyUser = (req, res, next) => {
    const authorization = req.headers['authorization']
    jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) return res.status(400).send('you need to log in')
        req.user = payload
        next()
    })
}

module.exports = verifyUser