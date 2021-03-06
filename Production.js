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
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('reset-table',context);
    })
  });
});

/*
app.get('/insert',function(req,res,next){
  var context = {};
  mysql.pool.query("INSERT INTO workouts (name,reps,weight,date,lbs) VALUES (?,?,?,?,?)", [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.lbs], function(err, result){
    if(err){
      next(err);
      return;
    }
    context.results = "Inserted id " + result.insertId;
	console.log(result);
    res.render('workout',result);
  });
});
*/


app.get('/workout',function(req,res,next){
  var context = {};
  
  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
  console.log(rows);
  context.list = JSON.parse(JSON.stringify(rows));
   for(var i = 0; i < context.list.length; i++)
	  {
		if(context.list[i].lbs==1)
			context.list[i].measurement="lbs";
		else
			context.list[i].measurement="kg";
	  }
  console.log("GET");
  res.render('workout', context);
  });
});


app.post('/workout',function(req,res,next){
  var context = {};
  
  if(req.body['Add Item']){
	  console.log("add item");
	mysql.pool.query("INSERT INTO workouts (name,reps,weight,date,lbs) VALUES (?,?,?,?,?)", [req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.lbs], function(err, result){
    if(err){
      next(err);
      return;
    }
		context.insert = "Inserted id " + result.insertId;
		console.log(context.insert);
	});
  }
  
  if(req.body['DELETE']){
	  console.log("delete item");
	mysql.pool.query("DELETE FROM workouts WHERE id = ?", [req.body.id], function(err, result){
    if(err){
      next(err);
      return;
    }
		context.deleted = "Deleted id " + result.insertId;
		console.log(context.deleted);
	});
  }
  
  if(req.body['UPDATE']){
	  console.log("update item");
	mysql.pool.query("UPDATE workouts SET name = ?,	reps = ?, weight = ?, date = ?,	lbs = ? WHERE id = ?", [req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.lbs, req.body.id], function(err, result){
    if(err){
      next(err);
      return;
    }
		context.results = "Updated " + result.changedRows + " rows.";
		console.log(context.results);
	});
  }
  
  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.list = JSON.parse(JSON.stringify(rows));
	  for(var i = 0; i < context.list.length; i++)
	  {
		if(context.list[i].lbs==1)
			context.list[i].measurement="lbs";
		else
			context.list[i].measurement="kg";
	  }
	console.log("POST");
    res.render('workout', context);
  });
});


app.post('/workoutupdate',function(req,res){

var context = {};
		
 
  context.id = [req.body.id];
  context.name = [req.body.name];
  context.reps = [req.body.reps];
  context.weight = [req.body.weight];
  context.date = [req.body.date];
  context.lbs = [req.body.lbs];
  if(context.lbs == "1")
	  context.options = "<option selected=\"selected\" value=\"1\">lbs</option> <option value=\"0\">kg</option>";
  else
	  context.options = "<option value=\"1\">lbs</option> <option selected=\"selected\" value=\"0\">kg</option>";
  
  console.log(context);
  
  res.render('workoutupdate', context);
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