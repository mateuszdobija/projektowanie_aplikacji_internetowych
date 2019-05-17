var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const bcrypt = require('bcrypt');

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

/* POST admin logowanie. */
router.post('/admin', function(req, res, next) {

  var email = req.body.email;
  var password = req.body.password;


  var query = " Select * from Users where email = '" + email + "'";

  console.log('query:', query);
  db.query(query, function(err, data) {
	    res.redirect('/');
	});
});
module.exports = router;
