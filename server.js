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
    nodemailer = require('nodemailer');

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
  socket.on('dispatch', function(data, img){
    console.log(socket.id, "tweeted", data, img);
    var image = img.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(image, 'base64');
    var timestamp = Date.now();
    var params = {encoding: 'base64'};
    var img2 = fs.writeFile('./uploads/'+timestamp+'.jpg', buf);
    console.log(buf);
    var filename = 'uploads/'+timestamp+'.jpg';
    var b64 = fs.readFileSync(filename, params);
    T.post('media/upload', {media_data: b64}, uploaded);
    function uploaded(err, data, response){
      var id = data.media_id_string;
      var tweet = {status: "#Scribblez ", media_ids: [id]};
      T.post('statuses/update', tweet, function(err, data, response) {
        if(err){
          console.log("something went wrong");
          console.log(err);
        }
        else {
          console.log('Tweet content:', data);
        }
        });
    }

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

/*

*/
