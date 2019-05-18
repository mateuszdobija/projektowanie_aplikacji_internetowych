var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback : true
},
  function(req, username, password, done) {
    username = req.body.email;
    password = req.body.password;

    if(!username || !password ) { return done(null, false); }
      
    dbconn.query("select * from Admins where email = '"+ username+"'", function(err, rows){
      
      if (err) { return done(null, false) };
      if(!rows.length){ return done(null, false)}

      var encPassword = password;
      var dbPassword  = rows[0].haslo;

      bcrypt.compare(encPassword, dbPassword, function(err, res) {
      if(res) {
          return done(null, { first_name: rows[0].first_name, surname: rows[0].surname, email: rows[0].email });

      } else {
        return done(null, false);
      } 
      });

    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

/* GET samochody. */
router.get('/samochody', function(req, res, next) {

	var query = "select * from Cars";
	db.query(query, function(err, data) {
	      res.render('samochody', { title: 'Samochody', data: data });
	});

});

/* GET kontakt page. */
router.get('/kontakt', function(req, res, next) {
  res.render('kontakt', { title: 'Kontakt' });
});

/* GET rejestracja page. */
router.get('/rejestracja', function(req, res, next) {
  res.render('rejestracja', { title: 'Rejestracja' });
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
    res.render('admin', { title: 'Admin' });
});

/* GET user logowanie. */
router.get('/logowanie', function(req, res, next) {
  res.render('logowanie', { title: 'Logowanie' });
});

/* POST admin logowanie. */
router.post('/admin', function(req, res, next) {

  passport.authenticate('local', { successRedirect: '/',
  failureRedirect: '/kontakt' });

  //var query = " Select * from Admins where email = '" + email + "'";

  //console.log('query:', query);
  //db.query(query, function(err, data) {
    //dopisać autentykację

	    //res.redirect('/');
});


/* POST admin logowanie. */
router.post('/logowanie', function(req, res, next) {

  var email = req.body.email;
  var password = req.body.password;



  var query = " Select * from Users where email = '" + email + "'";

  console.log('query:', query);
  db.query(query, function(err, data) {
    //dopisać autentykację

	    res.redirect('/');
	});
});

//router.get('/favicon.ico', (req, res) => res.status(204));
module.exports = router;

