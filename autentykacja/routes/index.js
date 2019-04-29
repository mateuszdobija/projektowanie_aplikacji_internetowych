var express = require('express');
var router = express.Router();
var passport = require('passport');

var GitHubStrategy = require('passport-github').Strategy;

passport.use(new GitHubStrategy({
    clientID: '959edd9d7a69fbafa796',
    clientSecret: '0a6f76092afbae940bb27903f21c595bc8583685',
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null,  profile);
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

router.get('/auth/github', passport.authenticate('github'));

router.get('/auth/github/callback',
    passport.authenticate('github', {
        successRedirect: '/zalogowano',
        failureRedirect: '/home'
}));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('home', { title: 'home' });
});

router.get('/zalogowano', function(req, res, next) {
  res.render('zalogowano', { title: 'zalogowano' });
});

module.exports = router;
