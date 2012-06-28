var express = require('express');
var app = require('express').createServer();

var comments = [];


app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.bodyParser());
});
app.listen(3000);

// lets create some vars for the data
// break out routes into a route file ?
app.get('/', function(req, res){
  res.send('hi');
});

app.post('comment/add', function(req, res){
  comments.push(req.body);
  res.send({200: 'ok');
});

app.get('/comment/list/:ts?', function(req, res){
  var ts = req.params.ts;
  if (!ts){
    res.send(comments);
  } else {
    var current;
    for (var i=0; i<comments.length; i+=1){
      current = comments[i];
      if (current.ts < ts){
        continue;
      }
      break;
    }
    var subset = comments.slice(i);
    res.send(subset);
  }
});
