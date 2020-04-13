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

router.post('/create', (req, res) => {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        userID: req.body.userID
    });

    let username = req.body.username;
    let userID = req.body.userID;
    
    User.findOne({username: username}, {userID: userID})
        .then(user =>{
            if(user){
                return res.status(404).json({username: 'Username not found'}, 
                                            {userID: 'userID not found'});    
            }else{
                bcrypt.genSalt(10, (err, salt) =>{
                    bcrypt.hash(newUser.password, salt, (err, hash) =>{
                        newUser.password = hash;       
                        //save the user to db
                        newUser.save().then(user => res.json(user));
                    })
                })
            }
        }).catch(err =>{
            throw err;
        })
    
    
    
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
                        const token =jwt.sign(
                            {userID: user._id},
                            `${randW}`,
                            {expiresIn: '24h'});
                            res.status(200).json({
                                userID: user.userID,
                                token: token
                            });
                    }
                }).catch(err =>{
                   throw err;
                })
            }
        }).catch(err =>{
            throw err;
        })
})


module.exports =  router; 