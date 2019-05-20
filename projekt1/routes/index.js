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
  
  if (req.isAuthenticated() && req.user.isAdmin == 0) { next(); } else res.redirect('/logowanie');
 }

 function isAuthenticatedSomeone(req, res, next) {
  
  if (req.isAuthenticated()) { next(); } else res.redirect('/logowanie');
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

function FirstBeforeSecond(date1, date2){
    return +(new Date(date2)) >= +(new Date(date1));
}

router.get('/samochody_dostepne/:start/:end', isAuthenticatedUser, 
  function(req, res, next)
  {
    var start = req.params.start;
    var end = req.params.end;

    var query = "select * from Cars";
    var cars = new Set();
	  db.query(query, function(err, data) {
        //res.render('samochody', { title: 'Samochody', data: data , user:req.user });
        //console.log('dlugosc:', data.length ) //ilośc samochodów z bazy - działa
        
        for(var i = 0; i < data.length; i++)
        {
          cars.add(data[i].registration_number);
        }
        console.log('cars:', cars)  //zbiór numerów rejestracyjnych samochodów z bazy


        var query = "select id,registration_number, DATE_FORMAT(start , '%Y-%m-%d') as start, DATE_FORMAT(end , '%Y-%m-%d') as end, status from Hires";
        db.query(query, function(err, data) {
         // console.log('wywołano Hires');
          for(var i = 0; i < data.length; i++)
          {
            var startdb = data[i].start;
            var enddb = data[i].end;
            //console.log('w pętli');
            if( FirstBeforeSecond(start, startdb)== true && FirstBeforeSecond(startdb,end ) == true) //daty nachodza na siebie
            {
              cars.delete(data[i].registration_number);
              //console.log('usuwamy:');
            }
            else if ( FirstBeforeSecond(startdb, start)== true && FirstBeforeSecond(start, enddb) == true) //daty nachodzą na siebie
            {
              cars.delete(data[i].registration_number);
              //console.log('usuwamy:');
            }
            else{
            /*  console.log('nie usuwamy');
              console.log('start:', start);
              console.log('startdb:', startdb);
              console.log('end:', end);
              console.log('enddb:', enddb)*/
            }
          }
          //console.log('auta po usunieciu:', cars);
          var term = Math.floor(( Date.parse(end) - Date.parse(start) ) / 86400000)+1; 
          var query = "select* from Cars where registration_number in ('"+Array.from(cars).join('\',\'') + "')";
          db.query(query, function(err, data) {
            res.render('wyszukano', { title: 'wyszukano' , user:req.user, data:data, start:start, end:end, term:term});

          });
          console.log('query', query);
        });

    
    });
    
});

/* Post zarezerwuj. */
router.get('/zarezerwuj/:registration_number/:start/:end',isAuthenticatedUser, function(req, res, next) {
  
  var registration_number = req.params.registration_number;
  var start = req.params.start;
  var end = req.params.end;
  var term = Math.floor(( Date.parse(end) - Date.parse(start) ) / 86400000)+1; 

	var query = "insert into Hires (registration_number, start, end, status,email, term) values ('"+registration_number+"','"+start + "','"+ end + "','niezatwierdzone','"+ req.user.email+"','"+term+"')";
	db.query(query, function(err, data) {
        if(err)
        {
          console.log(err);
        }
        res.redirect('/');
        console.log('query:',query);
	});

});

router.get('/user_panel',isAuthenticatedUser,function(req, res, next) {
  
  query = "select * from ( select id , registration_number,DATE_FORMAT(start , '%Y-%m-%d') as start,DATE_FORMAT(end , '%Y-%m-%d') as end,status,email,term from Hires where email= '"+ req.user.email + "')as Hires join Cars on Hires.registration_number = Cars.registration_number";


  db.query(query, function(err, data) {
    console.log(data);
    res.render('user_panel', { title: 'user_panel' , user:req.user, data:data});

  });

});

router.get('/anuluj_rezerwacje/:id',isAuthenticatedUser,function(req, res, next) {

  var id = req.params.id;
  query = "delete from Hires where id = "+id;

  db.query(query, function(err, data) {
    console.log(data);
    res.redirect('/user_panel');

  });
});

router.get('/modyfikuj_rezerwacje/:id',isAuthenticatedUser,function(req, res, next) {

  var id = req.params.id;

  query = "select * from ( select id , registration_number,DATE_FORMAT(start , '%Y-%m-%d') as start,DATE_FORMAT(end , '%Y-%m-%d') as end,status,email,term from Hires where email= '"+ req.user.email + "')as Hires join Cars on Hires.registration_number = Cars.registration_number where id = "+id;


  db.query(query, function(err, data) {
    console.log(data);
    res.render('modyfikuj_rezerwacje', { title: 'modyfikuj rezerwacje' , user:req.user, data:data});

  });
});
/*
router.get('/modyfikuj_rezerwacje/:id',isAuthenticatedUser,function(req, res, next) {

  var id = req.params.id;

  query = "select * from ( select id , registration_number,DATE_FORMAT(start , '%Y-%m-%d') as start,DATE_FORMAT(end , '%Y-%m-%d') as end,status,email,term from Hires where email= '"+ req.user.email + "')as Hires join Cars on Hires.registration_number = Cars.registration_number where id = "+id;


  db.query(query, function(err, data) {
    console.log(data);
    res.render('modyfikuj_rezerwacje', { title: 'modyfikuj rezerwacje' , user:req.user, data:data});

  });
});*/

router.post('/modyfikuj_rezerwacje',isAuthenticatedSomeone,function(req, res, next) {

  var id = req.body.hidden_id;
  var start = req.body.start;
  var end = req.body.end;

  query = "update Hires set start='"+start+"', end = '"+end+"' where id = "+id;
  console.log('query:', query);

  db.query(query, function(err, data) {
    console.log(data);
    res.redirect('/user_panel');

  });
});

router.get('/admin_panel',isAuthenticatedAdmin,function(req, res, next) {
  
  query = "select * from ( select id , registration_number,DATE_FORMAT(start , '%Y-%m-%d') as start,DATE_FORMAT(end , '%Y-%m-%d') as end,status,email,term from Hires )as Hires join Cars on Hires.registration_number = Cars.registration_number";


  db.query(query, function(err, data) {
    console.log(data);
    res.render('admin_panel', { title: 'admin_panel' , user:req.user, data:data});

  });

});

router.get('/confirm/:id',isAuthenticatedAdmin,function(req, res, next) {
  
  var id = req.params.id;
  query = "update Hires set status = 'zatwierdzone' where id = "+id; 


  db.query(query, function(err, data) {
    console.log(data);
    res.redirect('/admin_panel');

  });

});

module.exports = router;

