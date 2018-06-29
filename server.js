var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    config = require(path.join(__dirname, 'twitter_config.js')),
    express = require('express'),
    app = express();
app.use(express.static(__dirname + '/'));
app.get('/', function (req, res){
  res.render('index.html', {})
})
app.listen(process.env.PORT || 3000);

var T = new Twit(config);
/*
T.post('statuses/update', { status: 'woo whoooop!!!!!!' }, function(err, data, response) {
  console.log(data)
});
*/
