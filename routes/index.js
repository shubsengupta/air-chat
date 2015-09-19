var express = require('express'); 
var request = require('request');
var router = express.Router();


var apiKey = '401813aeec56e856a1b8048cb6b15857';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/comment', function (req, res,next) {
	var data = req.body;
	request.post({ url:'http://apiv2.indico.io/sentiment?key=' + apiKey, form: data }, function (error, response, body) {
  	if (!error && response.statusCode == 200) {
    	res.send(body);
  	}
  	if (error){
  		res.sendStatus(400);
  	}
  	});
});

module.exports = router;
