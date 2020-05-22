const Validator = require('validator');
const validText = require('./validating-text');


module.exports = function validateRegister(data){
    let errors = {};
    data.username = validText(data.username) ? data.username: ''
    data.password = validText(data.password) ? data.password: ''
    data.userID = validText(data.userID) ? data.userID: ''

    //validating email
    // if(!Validator.isEmail(data.email)){
    //     errors.email= "Email is invalid"
    // }

    // if(!Validator.isEmpty(data.email)){
    //      errors.email= "Email is empty"
    // }



    if(!Validator.isLength(data.password, {min: 2, max: 30})){
        errors.password = "Password must be between 2 - 30 charsters"
    }
    if(Validator.isEmpty(data.password)){
        errors.password= "Passwors is empty"
    }
    if(Validator.isEmpty(data.username)){
        errors.password= "Username is empty"
    }
    if(Validator.isEmpty(data.userID)){
        errors.password= "userID is empty"
    }
    return{
        errors, 
        isValid: Object.keys(errors).length === 0
    }
}