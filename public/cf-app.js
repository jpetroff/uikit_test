var express = require('express');

var out = __dirname + '/';

var app = express()

app.use(express.static(out))

app.get('/', function (req, res) {
	res.sendFile(out + '/pages/index.html')
})

app.listen('8082', 'localhost', function () {
	console.log('express has took off')
})