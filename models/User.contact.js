
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
//create schema 
const ContactsSchema = new Schema({
    userID: {
        type: String,
        required: true,
        trim: true
    },
    contact: [
        { userID: {type: String, require: true, trim: true}}
    ]
});

module.exports = Contacts = mongoose.model('Contacts', ContactsSchema);

//,date:{type: Date,default: Date.now }