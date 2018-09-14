const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");

mongoose.connect('mongodb://localhost:27017/loginDetails',{ useNewUrlParser: true });
var userSchema=new mongoose.Schema({
    username:{
        type: String,
        index: { unique: true, dropDups: true }
    },
    passwordHash: {type: String},
    firstname: {type: String},
    lastname: {type: String}
});

userSchema.plugin(uniqueValidator);

//Compares the password that has been typed in by the user and the password stored in this.passwordHash for that username.
userSchema.methods.validPassword = function(body_password) {
  return bcrypt.compareSync(body_password, this.passwordHash);
};

//Stores the encrypted value of the password into this.passwordHash.
userSchema.virtual("password").set(function(value) {
  this.passwordHash = bcrypt.hashSync(value, 10);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
