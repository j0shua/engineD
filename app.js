var express = require('express');

var app = require('express').createServer();

app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.listen(3000);

// lets create some vars for the data
// break out routes into a route file ?
app.get('/', function(req, res){
  res.send('hi');
});

app.get('/hi', function(req, res){
  res.send('hi');
});
