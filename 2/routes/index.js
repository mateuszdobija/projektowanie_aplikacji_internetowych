var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

//localhost:3000/ala/kowalska

router.get('/powitanie1/:imie/:nazwisko', function(req, res, next) {
	var imie = req.params.imie;
	var nazwisko = req.params.nazwisko;
	res.render('powitanie', { title: 'Express', imie:imie, nazwisko:nazwisko });
});


//localhost:3000/
//podać w formularzu imie i nazwisko i zatwierdzić przyciskiem Wyślij1

router.post('/powitanie2', function(req, res, next) {
	var imie = req.body.imie;
	var nazwisko = req.body.nazwisko;
	res.render('powitanie', { title: 'Express', imie:imie, nazwisko:nazwisko  });
});


//localhost:3000/
//podać w formularzu imie i nazwisko i zatwierdzić przyciskiem Wyślij2

router.get('/powitanie3', function(req, res, next) {
	var imie = req.query.imie;
	var nazwisko = req.query.nazwisko;
	res.render('powitanie', { title: 'Express', imie:imie, nazwisko:nazwisko  });
});

module.exports = router;
