var express = require('express');

var out = __dirname + '/public';

var app = express()

app.use(express.static(out))

app.get('/', function (req, res) {
	res.sendFile(out + '/pages/index.html')
})

app.get('/loader', function (req, res) {
	res.sendFile(out + '/pages/loading.html')
})

app.listen('80', '0.0.0.0', function () {
	console.log('express has took off')
})