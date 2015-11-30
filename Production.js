var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/images', express.static(__dirname + '/images'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);

function getRandomNum() {
	var stuff = {};
	stuff.randomNum = Math.floor((Math.random() * 10) + 1);
	return stuff;
}

app.get('/',function(req,res){
  res.render('home')
});

app.get('/randomnum',function(req,res){
  res.render('randomnum', getRandomNum());
});

app.get('/apihowto',function(req,res){
  res.render('apihowto', getRandomNum());
});

app.get('/getownedgames',function(req,res)
{
	console.log("getownedgames");
	
	document.getElementById('formSubmit').addEventListener('click', function(event){
		console.log("IT WORKED!");
		/*
		var req = new XMLHttpRequest();
		var payload = {yourName:null, species:null, eatsCats:null};
		
		payload.yourName = document.getElementById('yourName').value;
		for (var i = 0; i < radios.length; i++)
		{
			if(radios[i].checked)
				payload.species = radios[i].value;
		}
		
		payload.eatsCats = document.getElementById('eatCats').checked;
			
		req.open('GET', 'http://httpbin.org/post', true);
		
		req.addEventListener('load',function(){
		if(req.status >= 200 && req.status < 400)
		{
			var response = JSON.parse(req.responseText);
			console.log("Message=" + response.message);
			document.getElementById('returnCode').textContent = req.responseText;
			document.getElementById('returnName').textContent = response.json.yourName;
			document.getElementById('returnSpecies').textContent = response.json.species;
			if(response.json.eatsCats == true)
				document.getElementById('returnEatCats').textContent = "Yes";
			else
				document.getElementById('returnEatCats').textContent = "No";
		} else {
				console.log("Error in network request: " + request.statusText);
			}
		});
		req.send(JSON.stringify(payload));
		event.preventDefault();
		*/
	});

	res.render('getownedgames', getRandomNum());
});



app.get('/other-page',function(req,res){
  res.render('other-page');
});

app.get('/getownedgames',function(req,res){
  res.render('getownedgames');
});

app.get('/getpost',function(req,res){
  var pArray = [];
  for (var p in req.query){
    pArray.push({'name':p,'value':req.query[p]});
  }
  var toPass = {};
  toPass.params = pArray;
  res.render('getresponse', toPass);
});

app.post('/getpost', function(req,res){
  var postArray = [];
  for (var p in req.body){
    postArray.push({'name':p,'value':req.body[p]});
  }
  var toPass = {};
  toPass.params = postArray;
  res.render('postresponse', toPass);
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});
 
app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});