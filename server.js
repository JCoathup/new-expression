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
  socket.on ('disconnect', function(socket){
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });
  socket.on('message', function(data){
    console.log(socket.id, "posted", data.comment);
    var image = data.image.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(image, 'base64');
    fs.writeFile('./uploads/'+socket.id+'.jpg', buf);
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'jeremycoathup@gmail.com',
        pass: '517a7e76'
      }
    });

    var mailOptions = {
      from: 'jeremycoathup@gmail.com',
      to: data.comment,
      subject: 'Made using New Expressions',
      text: "A New Expression",
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
T.post('statuses/update', { status: 'woo whoooop!!!!!!' }, function(err, data, response) {
  console.log(data)
});
*/
