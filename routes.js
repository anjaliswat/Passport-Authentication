const express = require("express");
const router = express.Router();
const User = require("./User");

// This function will kick the user back to login page if the user is not logged in.
const loggedIn = (req, res, next) => {
  if (req.isAuthenticated()) next();
  else res.redirect("/login");
};

// This will return the user to the login  if the user has logged out.
const loggedOut = (req, res, next) => {
  if (req.isUnauthenticated()) next();
  else res.redirect("/");
};

function authenticate(passport) {
  //This will call the loggedIn function, and if the user has loggen in, print a message for the user on the index page.
  router.get("/", loggedIn, (req, res) => {
    res.render("index", { firstname: req.user.firstname });
  });

  //Renders the login page.
  router.get("/login", loggedOut, (req, res) => {
    res.render("login");
  });

  //When the user enters their credentials, based on whether it is valid or not, the page will be redirected. If it is invalid an error message will flash.
  router.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true
    })
  );

  //Renders the register page.
  router.get("/register", loggedOut, (req, res) => {
    res.render("register");
  });

  router.post('/register', function(req,res){
    var Username = req.body.username;
    var password = req.body.password;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;

    //Checks whether the username already exists in the db. If it does it throughs an error.
    User.findOne({username: req.body.username},function(err,user){
      if(user)
      {
        req.flash("That username already exists. Please try a different one!");
        res.redirect('/register')
      }
      else {
        var newuser=new User();
        newuser.username = Username;
        newuser.password = password;
        newuser.firstname = firstname;
        newuser.lastname = lastname;
        newuser.save(function(err,savedUser){
            if(err){
                console.log(err);
                res.redirect('/register')
            }
            res.redirect('/')
        })
      }
    })
  })

  //Logs the user out and redirects the user to the login page.
  router.all("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
  });

  router.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).end(err.stack);
  });
  return router;
}

module.exports = authenticate;
