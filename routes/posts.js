const router = require('express').Router()
const fs = require('fs')
const uuid = require("uuid")
const verifyUser = require('../verification')
const dataRoute = 'C:/Users/97250/Desktop/my-Project/nodejs-auth/data'


router.get('/', verifyUser, (req, res) => {
    fs.readFile(`${dataRoute}/posts.json`, 'utf8', (err, posts) => {
        if (err) return res.sendStatus(500)
        posts = JSON.parse(posts)
        const userPosts = posts.filter(post => post.publisherID == req.user.id)
        if (!userPosts.length) return res.status(400).send('No posts upload')
        res.send(userPosts)
    })
})

router.post('/add', verifyUser, (req, res) => {
    const { title, desc } = req.body
    const user = req.user
    const newPosts = {
        id: uuid.v4(),
        publisherID: user.id, 
        publisher: user.name, 
        title,
        desc}  
    fs.readFile(`${dataRoute}/posts.json`, 'utf8', (err, posts) => {
        if (err) return res.sendStatus(500)
        posts = JSON.parse(posts)
        posts.push(newPosts)
        fs.writeFile(`${dataRoute}/posts.json`, JSON.stringify(posts), err => {
            if (err) return res.sendStatus(500)
            res.sendStatus(201)
        })
    })
})

router.put('/edit/:postID', verifyUser, (req, res) => {
    const { postID } = req.params
    const { title, desc } = req.body
    fs.readFile(`${dataRoute}/posts.json`, 'utf8', (err, posts) => {
        if (err) return res.sendStatus(500)
        posts = JSON.parse(posts)
        let post = posts.find(post => post.id == postID)
        if (!post) return res.send('Post ID not found')
        if (post.publisherID != req.user.id) return res.status(400).send('Forbidden')
        newPost = {...post, title, desc}
        const index = posts.findIndex(post => post.id == postID)
        posts[index] = newPost
        fs.writeFile(`${dataRoute}/posts.json`, JSON.stringify(posts), err => {
            if (err) return res.sendStatus(500)
            res.sendStatus(202)
        })        
    })
})

router.delete('/delete/:postID', verifyUser, (req, res) => {
    const { postID } = req.params
    fs.readFile(`${dataRoute}/posts.json`, 'utf8', (err, posts) => {
        if (err) return res.sendStatus(500)
        posts = JSON.parse(posts)
        let post = posts.find(post => post.id == postID)
        if (!post) return res.send('Post ID not found')
        if (post.publisherID != req.user.id) return res.status(400).send('Forbidden')
        posts = posts.filter(post => post.id != postID)
        fs.writeFile(`${dataRoute}/posts.json`, JSON.stringify(posts), err => {
            if (err) return res.sendStatus(500)
            res.sendStatus(200)
        })        
    })
})


module.exports = router