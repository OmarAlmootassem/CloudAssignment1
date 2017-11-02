var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(__dirname + '/app'));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

app.listen(process.env.PORT || 3000);

module.exports = app;