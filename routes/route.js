const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var randomWords = require('random-words');
//Item Model
const User = require('../models/user.model');

//@route get api/items
// @desc get all items
// @access public

router.get('/users', (req, res) => {
    User
        .find()
        .sort({date: -1})
        .then(user => res.json(user))
});

//@route post api/items
// @desc post an items
// @access public

router.post('/create', async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        userID: req.body.userID
    });

    let username = req.body.username;
    let userID = req.body.userID;
    try{
        let verify = await User.findOne({ $or: [{username: username}, {userID: userID}]})
            if(verify){
                 res.status(400).send({ message: "This user already existed" });
            }else{
                bcrypt.genSalt(10, (err, salt) =>{
                    bcrypt.hash(newUser.password, salt, (err, hash) =>{
                        newUser.password = hash;       
                        //save the user to db
                        newUser.save()
                        .then(user => 
                            res.json(user)
                        ).catch(() =>{
                            es.json({err: 'User not saved'})
                        })
                    })
                })
            }
        }catch(error){
            res.status(500).send(error);
        }
    
    
    
});

//@route DELETE api/items/:id
// @desc DELETE an items
// @access public

router.delete('/user/:id',(req, res) => {
    User.findById(req.params.id).then(user => 
            user.remove().then(() => res.json({success: true}))
        )
        .catch(err => res.status(404).json({success: false}))
});


router.post('/login',  (req, res) => {
    const userInfo = {
        username: req.body.username,
        password: req.body.password,
       
    }
    let username = userInfo.username
    let password = userInfo.password
    let randW = randomWords();
    User.findOne({username: username})
        .then(user =>{
            if(!user){
                return res.status(404).json({username: 'Username not found'});
            }else{
                bcrypt.compare(password, user.password).then(isMatch =>{
                    if(!isMatch){
                        return res.status(401).json({username: 'Password is incorrect'})
                    }else{
                        // const token =jwt.sign(
                        //     {userID: user._id},
                        //     `${randW}`,
                        //     {expiresIn: '24h'});
                        //     res.status(200).json({
                        //         userID: user.userID,
                        //         token: token
                        //     });
                        jwt.sign({user}, 'privatekey', { expiresIn: '75h' },(err, token) => {
                            if(err) { console.log(err) }    
                            res.send(token);
                        });
                    }
                }).catch(err =>{
                   throw err;
                })
            }
        }).catch(err =>{
            throw err;
        })
});

//projected data 

router.get('/user/auth', checkToken, (req, res) => {
    jwt.verify(req.token, 'privatekey', (err, user) =>{
        if(err){
            res.status(403).json({err: 'token error'})
        }else{
            res.json(user.user)
        }
    })
});



function checkToken(req, res, next) {
    const header = req.headers['authorization'];

    if(typeof header !== 'undefined') {
        const bearer = header.split(' ');
        const token = bearer[1];

        req.token = token;
        next();
    } else {
        //If header is undefined return Forbidden (403)
        res.sendStatus(403)
    }
}


module.exports =  router; 