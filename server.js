var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    config = require(path.join(__dirname, 'twitter_config.js')),
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    connections = [],
    nodemailer = require('nodemailer'),
    OAuth= require('oauth').OAuth;

app.use(express.static(__dirname + '/'));
app.get('/', function (req, res){
  res.render('index.html', {})
})
server.listen(process.env.PORT || 3000);
console.log("server running");
var T = new Twit(config);

io.sockets.on('connection', function(socket) {
  console.log('socket.io connected', socket.id);
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);
  //on user disconnections
  socket.on('dispatch', function(data){

   T.get('account/verify_credentials', { skip_status: true })
  .catch(function (err) {
    console.log('caught error', err.stack)
  })
  .then(function (result) {
    //console.log(result.data);
    // `result` is an Object with keys "data" and "resp".
    // `data` and `resp` are the same objects as the ones passed
    // to the callback.
    // See https://github.com/ttezel/twit#tgetpath-params-callback
    // for details.

    console.log('data', result.data);
    console.log('response', result.resp);
  })

    console.log(socket.id, "tweeted", data.tweetContent);
    var message = data.tweetContent;
    var image = data.image.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(image, 'base64');
    console.log(buf);
    var timestamp = Date.now();
    img = fs.writeFile(__dirname + '/uploads/'+timestamp+'.jpg', buf, function(){console.log("done");
    var filename = "uploads/"+timestamp+".jpg";
    var params = {encoding: "base64"};
    var b64 = fs.readFileSync(filename);
    T.post("media/upload", {media_data: image}, uploaded);
    function uploaded (err, data, response){
      //console.log(err);
      console.log("Data:", data);
      var id = data.media_id_string;
      console.log("Media ID: ", id);
      var tweet = {status: message, media_ids:[id]}
      T.post("statuses/update", tweet, tweeted);
    }
    function tweeted(err, data, response){
      if (err){
        console.log("ERROR:", err);
      }
      else {
        console.log("it worked");
      }
    }
  });
  });
  socket.on ('disconnect', function(socket){
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });
  socket.on('email', function(data){
    console.log(socket.id, "posted", data.comment);
    var image = data.image.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(image, 'base64');
    var timestamp = Date.now();
    fs.writeFile('./uploads/'+timestamp+'.jpg', buf);
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jeremycoathup@gmail.com',
        pass: '2fARNz6h'
      }
    });

    var mailOptions = {
      from: 'jeremycoathup@gmail.com',
      to: data.emailAddress,
      subject: 'Made using Scibblez',
      text: "Scribblez",
      html: "<h1>"+data.comment+"</h1><img src='cid:"+socket.id+"'>",
         attachments: [
      {   // data uri as an attachment
    filename: "image.jpg",
    path: data.image,
    cid: socket.id
}]
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  })
});
