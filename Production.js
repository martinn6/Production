var express = require('express');
var mysql = require('./ConnectDB.js');


var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var request = require('request');

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

app.get('/reset-table',function(req,res,next){
  var context = {};
  [your connection pool].query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    [your connection pool].query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});


app.get('/',function(req,res){
  res.render('home')
});

app.get('/randomnum',function(req,res){
  res.render('randomnum', getRandomNum());
});

app.get('/apihowto',function(req,res){
  res.render('apihowto');
});

app.get('/getownedgames',function(req,res){
  var context = {};
  console.log(req.query);
  context.yourAPIKey = req.query.yourAPIKey;
  context.valveUserID = req.query.valveUserID;
  if(req.query['showGameInfo'])
  {
	  showGameInfo = 1;
	  context.showGameInfo = "checked='true'";
  }
  else
  {
	showGameInfo = 0;
	context.showGameInfo = "";
  }  
  res.render('getownedgames', context);
   
});

app.post('/getownedgames',function(req,res,next){
  var context = {};
  var body = {};
  var showGameInfo;
  console.log("POST");
  console.log(req.body);
  context.yourAPIKey = req.body.yourAPIKey;
  context.valveUserID = req.body.valveUserID;
  if(req.body['showGameInfo'])
  {
	  showGameInfo = 1;
	  context.showGameInfo = "checked='true'";
  }
  else
  {
	showGameInfo = 0;
	context.showGameInfo = "";
  }
  console.log("showGameInfo=" + showGameInfo);
  request('http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key='+ context.yourAPIKey+'&steamid=' + context.valveUserID + '&format=json&include_appinfo=' + showGameInfo, function(err, response, body){
    if(!err && response.statusCode < 400){
	  body = JSON.parse(body);
	  context.numberofgames = body.response.game_count;
      context.games = body.response.games;
      res.render('getownedgames',context);
    } else {
      if(response){
        console.log(response.statusCode);
      }
      next(err);
    }
  });
});


app.get('/getnewsforapp',function(req,res){
  var context = {};
  console.log(req.query);
  context.yourAPIKey = req.query.yourAPIKey;
  context.valveAppID = req.query.valveAppID;
  context.maxCount = req.query.maxCount;
  res.render('getnewsforapp', context);
   
});

app.post('/getnewsforapp',function(req,res,next){
  var context = {};
  var body = {};

  console.log("POST");
  console.log(req.body);
  context.yourAPIKey = req.body.yourAPIKey;
  context.valveAppID = req.body.valveAppID;
  context.maxCount = req.body.maxCount;
  
  request('http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid='+ context.valveAppID  + '&count=' + context.maxCount + '&format=json', function(err, response, body){
    if(!err && response.statusCode < 400){
	  body = JSON.parse(body);
      context.newsitems = body.appnews.newsitems;
	  console.log(body.appnews);
      res.render('getnewsforapp',context);
    } else {
      if(response){
        console.log(response.statusCode);
      }
      next(err);
    }
  });
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