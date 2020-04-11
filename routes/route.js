const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
//Item Model
const User = require('../models/user.model');



//@route get api/items
// @desc get all items
// @access public

router.get('/user', (req, res) => {
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

    bcrypt.genSalt(10, (err, salt) =>{
        bcrypt.hash(newUser.password, salt, (err, hash) =>{
            newUser.password = hash;
            //res.send(newUser.password)
            newUser.save().then(user => res.json(user));
        })
    })
    //save the item posted
    //newUser.save().then(user => res.json(user));
});

//@route DELETE api/items/:id
// @desc DELETE an items
// @access public

router.delete('/:id',(req, res) => {
    User.findById(req.params.id).then(user => 
            user.remove().then(() => res.json({success: true}))
        )
        .catch(err => res.status(404).json({success: false}))
});



router.post('/login',  (req, res) => {
    const userInfo = {
        username: req.body.username,
        password: req.body.password,
        userID: req.body.userID
    }
    let username = userInfo.username
    let password = userInfo.password
    User.findOne({username})
        .then(user =>{
            if(!user){
                return res.status(404).json({username: 'Username not found'});
            }else{
                bcrypt.compare(password, user.password).then(isMstch =>{
                    if(isMstch){
                        res.send('login!')
                    }else{
                        res.send('not match')
                    }
                })
            }
        })
})


module.exports =  router; 