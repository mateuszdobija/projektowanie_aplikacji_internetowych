var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const bcrypt = require('bcrypt');
var passport = require('passport');
var passportUser = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
const saltRounds = 10;

function isAuthenticatedAdmin(req, res, next) {
  
  if (req.isAuthenticated() && req.user.isAdmin == 1) { next(); } else res.redirect('/admin');
 }

 function isAuthenticatedUser(req, res, next) {
  
  if (req.isAuthenticated() && req.user.isAdmin == 0) { next(); } else res.redirect('/login');
 }

passport.use('admin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true
},
  function(req, username, password, done) {
    username = req.body.email;
    password = req.body.password;

    if(!username || !password ) { return done(null, false); }
      
    db.query("select * from Admins where email = '"+ username+"'", function(err, rows){
      
      if (err) { return done(null, false) };
      if(!rows.length){ return done(null, false)}

      var encPassword = password;
      var dbPassword  = rows[0].password;

      bcrypt.compare(encPassword, dbPassword, function(err, res) {
      if(res) {
          return done(null, { first_name: rows[0].first_name, surname: rows[0].surname, email: rows[0].email, isAdmin: 1 });

      } else {
        return done(null, false);
      } 
      });

    });
  }
));

passport.use('user', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true
},
  function(req, username, password, done) {
    username = req.body.email;
    password = req.body.password;

    if(!username || !password ) { return done(null, false); }
      
    db.query("select * from Users where email = '"+ username+"'", function(err, rows){
      
      if (err) { return done(null, false) };
      if(!rows.length){ return done(null, false)}

      var encPassword = password;
      var dbPassword  = rows[0].password;

      bcrypt.compare(encPassword, dbPassword, function(err, res) {
      if(res) {
          return done(null, { first_name: rows[0].first_name, surname: rows[0].surname, email: rows[0].email, isAdmin: 0 });

      } else {
        return done(null, false);
      } 
      });

    });
  }
));

passport.serializeUser( function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home', user:req.user });
});

/* GET samochody. */
router.get('/samochody', function(req, res, next) {

	var query = "select * from Cars";
	db.query(query, function(err, data) {
	      res.render('samochody', { title: 'Samochody', data: data , user:req.user });
	});

});

/* GET kontakt page. */
router.get('/kontakt', function(req, res, next) {
  res.render('kontakt', { title: 'Kontakt', user:req.user  });
});

/* GET rejestracja page. */
router.get('/rejestracja', function(req, res, next) {
  res.render('rejestracja', { title: 'Rejestracja', user:req.user  });
});

/* POST rejestracja. */
router.post('/zarejestruj', function(req, res, next) {

  var email = req.body.email;
  var first_name = req.body.first_name;
  var surname = req.body.surname;
  var birth_date = req.body.birth_date;
  var phone = req.body.phone;
  var password = req.body.password;

  const saltRounds = 10;
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {

      var query = " INSERT INTO Users values ('" + email + "','" + first_name + "','" + surname + "','" + birth_date + "','" + phone + "','" + hash + "')";

      db.query(query, function(err, data) {
	      res.redirect('/');
	    });
    });
  });
});

/* GET admin logowanie. */
router.get('/admin', function(req, res, next) {
    res.render('admin', { title: 'Admin' , user:req.user });
});

/* GET user logowanie. */
router.get('/logowanie', function(req, res, next) {
  res.render('logowanie', { title: 'Logowanie', user:req.user });
});

/* POST admin logowanie. */
router.post('/admin', function(req, res, next) {

  passport.authenticate('admin', { successRedirect: '/',
  failureRedirect: '/kontakt' })(req, res, next);

});


/* POST user logowanie. */
router.post('/logowanie', function(req, res, next) {

  passportUser.authenticate('user', { successRedirect: '/',
  failureRedirect: '/kontakt' })(req, res, next);
});

router.get('/wyloguj', isAuthenticatedUser, 
  function(req, res, next)
  {
    req.logout();
    console.log('wylogowano');
    res.redirect('/');
});

router.get('/wyloguj_admin', isAuthenticatedAdmin, 
  function(req, res, next)
  {
    req.logout();
    console.log('wylogowano');
    res.redirect('/');
});

/* GET haszowanie hasła dla admina. */
router.get('/admin_password_hash/:password', function(req, res, next) {

 
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.params.password, salt, function(err, hash) {

      console.log("hash:", hash);
      res.redirect('/');
    });
  });
  
});

router.get('/wyszukaj', isAuthenticatedUser, 
  function(req, res, next)
  {
    res.render('wyszukaj', { title: 'wyszukaj' , user:req.user });
});

router.post('/wyszukaj', isAuthenticatedUser, 
  function(req, res, next)
  {
    var start = req.body.start;
    var end = req.body.end;
    res.redirect('/samochody_dostepne/'+start+'/'+end);
});

router.get('/samochody_dostepne/:start/:end', isAuthenticatedUser, 
  function(req, res, next)
  {
    var start = req.params.start;
    var end = req.params.end;

    var query = "select * from Cars";
	  db.query(query, function(err, data) {
	      res.render('samochody', { title: 'Samochody', data: data , user:req.user });
	  });
    res.render('wyszukaj', { title: 'wyszukaj' , user:req.user });
});

module.exports = router;

