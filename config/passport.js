const jwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;

const mongoose = require('mongoose');
const User =  mongoose.model('User');
const Keys = require('../config/keys');

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = Keys.secretOrKey;

module.exports = passport => {
    passport.use(new jwtStrategy(options, (jwt_payload, done)=>{
        console.log(jwt_payload)
        User.findById(jwt_payload.id)
            .then(user =>{
                if(user){
                    done(null, user);
                }
                done(null, false);
            }).catch(err =>{
                console.log({err});
                
            })
    }));
};