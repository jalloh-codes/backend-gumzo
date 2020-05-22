const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
// const cors = require("cors");

const user = require('./routes/api/user');
const db =  require('./config/keys').mongoURI;
const passport = require('passport');

const app = express();



// var corsOptions = {
//   origin: "http://localhost:8081"
// };


mongoose.connect(db, {useUnifiedTopology: true, useNewUrlParser: true})
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
});


// app.use(cors(corsOptions));                                                                    


app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(passport.initialize());
require('./config/passport')(passport);
// parse requests of content-type - application/json
app.use(bodyParser.json());

const port = process.env.PORT || 8080;







// user route
app.use('/api/gumzo',  user);


// listen for requests
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});