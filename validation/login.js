const Validator = require('validator');
const validText = require('./validating-text');

module.exports = function(data){
    let errors = {};
    data.username = validText(data.username) ? data.username: ''
    data.password = validText(data.password) ? data.password: ''

    //validating email
    // if(!Validator.isEmail(data.email)){
    //     errors.email= "Email is invalid"
    // }

    if(Validator.isEmpty(data.username)){
         errors.username= "Username is empty"
    }

    if(Validator.isEmpty(data.password)){
        errors.password= "Password is empty"
    }
 
    return{
        errors, 
        isValid: Object.keys(errors).length === 0
    }
}