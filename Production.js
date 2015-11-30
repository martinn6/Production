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
  res.render('apihowto');
});

app.get('/getownedgames',function(req,res)
{
	console.log("getownedgames");
	var responseText = [];
	var response = [];
	var gameCount;
	var games = [];
	var context = {};
	
	//if(req.body['formSubmit']){

	//	console.log("formSubmit");

		
		var reqAppInfo = new XMLHttpRequest();
		reqAppInfo.open('GET', 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=8B6421C0C4A593FB05AD15FA71752C28&steamid=76561198031992079&format=json&include_appinfo=1');
	
		reqAppInfo.addEventListener('load', function()
		{
			responseText = JSON.parse(reqAppInfo.responseText);
			response = responseText.response;
			console.log("Response Loaded");
			gameCount = response.game_count; 
			console.log("inside gameCount: " + gameCount);
			games = response.games
		});
		console.log("outside gameCount: " + gameCount);
		reqAppInfo.send(null);
		
	//}
	context.numberofgames = gameCount || 0;
	context.games = response.games || [];
	console.log(context.games);
	res.render('getownedgames',context);
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