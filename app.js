const express = require("express");
const app = express();
const User = require("./User");
const expressHandlebars = require("express-handlebars");
const hbs = expressHandlebars.create({ defaultLayout: "application" });
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const expressSession = require("express-session");
app.use(
  expressSession({
    resave: false,
    saveUninitialized: true,
    secret:
      process.env.SESSION_SEC || "You must generate a random session secret"
  })
);

//Allows us to display error messages.
const flash = require("express-flash-messages");
app.use(flash());

//Connecting to the mongoose client.
const mongoose = require("mongoose");
app.use((req, res, next) => {
  if (mongoose.connection.readyState) next();
  else {
    const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/loginDetails";
    mongoose
      .connect(mongoUrl, { useMongoClient: true })
      .then(() => next())
      .catch(err => console.error(`Mongoose Error: ${err.stack}`));
  }
});

const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

//Determines which properties in the user object should be stored in the session.
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

//Saves userid so that the user object can be retrieved later.
passport.deserializeUser(function(userId, done) {
  User.findById(userId, (err, user) => done(err, user));
});

//Local strategy is a password authentication scheme provided by Passport. It will find a given user's password from username.
const LocalStrategy = require("passport-local").Strategy;
const local = new LocalStrategy((username, password, done) => {
  User.findOne({ username })
    .then(user => {
      if (!user || !user.validPassword(password)) {
        done(null, false, { message: "Invalid username/password" });
      } else {
        done(null, user);
      }
    })
    .catch(e => done(e));
});
passport.use("local", local);
app.use("/", require("./routes")(passport));

//Runs the app on localhost:3000
app.listen(3000, "localhost", () => console.log("Listening on port 3000"));
