const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys')
const passport = require('passport');
//Item Model
const User = require('../../models/User');
const Contacts = require('../../models/User.contact')
const  validatorRegister = require('../../validation/register')
const  validatorLogin = require('../../validation/login')

router.get('/users', (req, res) => {  
    User
        .find()
        .sort({date: -1})
        .then(user => res.json(user))
});

router.get('/contacts', (req, res) => {  
   
    Contacts
        .find()
        .sort({date: -1})
        .then(contact => res.json(contact))
        .catch(error =>{
            res.json({error})
        })        
});


router.post('/contacts/save', async (req, res) =>{
    const newContact = new Contacts({
        userID: req.body.userID,
        contact: [{userID: req.body.contact[0].userID}]
    })
    
    let verify = await Contacts.findOne({userID: newContact.userID})
    if(verify){  
        Contacts.findOne({userID: newContact.userID}, 
            {contact:  {$elemMatch: {userID: newContact.contact[0].userID}}
        }).then(match =>{
            if(match.contact.length == 0){
                Contacts.updateOne({userID: newContact.userID},
                {$push:{ 
                        contact: newContact.contact[0]}
                }).then(saved =>{
                    res.status(200).send({message: "userID saved"})
                }).catch(error =>{
                    res.status(401).send({error})
                })
            }else{
                res.status(401).send({message: "This userID already Saved"});
            }
        })
    }else{
        newContact.save()
        .then(contact => 
            res.status(200).send(contact)
        ).catch(error =>{
            res.json({error})
        })
    }
})

router.post('/create', async (req, res) => {
    const {errors, isValid} = validatorRegister(req.body);
    if(!isValid){
        return res.status(400).json(errors);
    }else{
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
                            if(err) throw err;
                            newUser.password = hash;       
                            //save the user to db
                            newUser.save()
                            .then(user => 
                                res.json(user)
                            ).catch((error) =>{
                                res.json({error: error})
                            })
                        })
                    })
                }
        }catch(error){
                res.status(500).send(error);
        }
    }
});

router.delete('/user/:id',(req, res) => {
    User.findById(req.params.id).then(user => 
            user.remove().then(() => res.json({success: true}))
        )
        .catch(err => res.status(404).json({success: false}))
});

router.post('/login',  (req, res) => {
    const {errors, isValid} = validatorLogin(req.body);
    if(!isValid){
        return res.status(400).json(errors);
    }
    const userInfo = {
        username: req.body.username,
        password: req.body.password,
    }
    let username = userInfo.username
    let password = userInfo.password

    User.findOne({username: username})
        .then(user =>{
            if(!user){
                return res.status(404).json({username: 'Username not found'});
            }else{
                bcrypt.compare(password, user.password).then(isMatch =>{
                    if(!isMatch){
                        return res.status(400).json({password: 'Password is incorrect'})
                    }else{

                        const payload = {
                            username: user.username,
                            userID: user.userID,
                            id: user.id
                        }
                        jwt.sign(
                            payload, 
                            keys.secretOrKey, 
                            { expiresIn: '365d' },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: "Bearer " + token
                                });
                                if(err) throw err;
                            }
                        );
                    }
                }).catch(err =>{
                throw err;
                })
            }
    }).catch(err =>{
            throw err;
    })
});

router.get('/user/auth', checkToken, (req, res) => {
    jwt.verify(req.token, 'privatekey', (err, user) =>{
        if(err){
            res.status(403).json({err: 'token error'})
        }else{
            res.json(user.user)
        }
    })
});

// You may want to start commenting in information about your routes so that you can find the appropriate ones quickly.
router.get('/gumzo/user', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.status(200).json({
        username: req.user.username,
        userID: req.user.userID
    });
  })

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