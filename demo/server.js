/*Dependencies.*/
var express = require("express");
var app = express();
var port = 3000;

/*Routes*/
app.use('/', express.static('./public/'));

/*Server.*/
app.listen(port, function() {
	console.log('App listening at port: %s', port);
});