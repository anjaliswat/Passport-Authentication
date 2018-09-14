const express = require("express");
const router = express.Router();
const User = require("./User");

const loggedIn = (req, res, next) => {
  if (req.isAuthenticated()) next();
  else res.redirect("/login");
};

const loggedOut = (req, res, next) => {
  if (req.isUnauthenticated()) next();
  else res.redirect("/");
};

function authenticate(passport) {
  router.get("/", loggedIn, (req, res) => {
    res.render("index", { firstname: req.user.firstname });
  });

  router.get("/login", loggedOut, (req, res) => {
    res.render("login");
  });

  router.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true
    })
  );

  router.get("/register", loggedOut, (req, res) => {
    res.render("register");
  });

  router.post('/register', function(req,res){
    var Username=req.body.username;
    var password=req.body.password;
    var firstname=req.body.firstname;
    var lastname=req.body.lastname;

    User.findOne({username: req.body.username},function(err,user){
      if(user)
      {
        req.flash("That username already exists. Please try a different one!");
        res.redirect('/register')
      }
      else{
        var newuser=new User();
        newuser.username=Username;
        newuser.password=password;
        newuser.firstname=firstname;
        newuser.lastname=lastname;
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
