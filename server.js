var fs = require('fs'),
    path = require('path'),
    config = require(path.join(__dirname, 'twitter_config.js')),
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    connections = [],
    nodemailer = require('nodemailer'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    session = require("express-session");

var user = {}, oA, twitterImage;

process.on('uncaughtException', function (err) {
    console.log(err);
});

app.use(express.static(__dirname + '/'));
app.get('/', function (req, res){
  res.render('index.html', {})
})

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/twitter', passport.authenticate('twitter'),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log(profile);
    console.log("authenticated");
    res.redirect('/');
});

app.get('/twitter/callback', passport.authenticate("twitter", { successRedirect: '/twitter/tweet'}), function(req, res){
  res.send("you reached the callback uri");
  io.emit("messagetype", " first hi!");
});

app.get('/twitter/tweet', function(req, res){
  postTweet(function(error, data) {
    if(error){
      console.log(require('sys').inspect(error));
      res.end("bad stuff happened");
    }
    else {
      console.log(data);
      res.end("all is well");
    }
  })
})

passport.use(new TwitterStrategy({
    consumerKey : config.consumer_key,
    consumerSecret: config.consumer_secret,
    callbackURL: "https://new-expression.herokuapp.com/twitter/callback"
    //passReqToCallback: true
  }, function(token, tokenSecret, profile, done) {
    if (profile) {
      user = profile;
      user.token = token;
      user.tokenSecret = tokenSecret;
      console.log(user);
      return done(null, user);
    }
    else {
      return done(null, false);
    }
}));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

function postTweet(callbacker){
  initTwitterPost();
  if (!user.token) {
    console.error("You didn't have the user log in first");
  }
  oA.post(
    "https://upload.twitter.com/1.1/media/upload.json"
    , user.token
    , user.tokenSecret
    ,{media_data: twitterImage}
    ,function(error, data, response){
      console.log("start uploading here -> MEDIA DATA: "+  data);
      data = JSON.parse(data);
      oA.post(
        "https://api.twitter.com/1.1/statuses/update.json"
      , user.token
      , user.tokenSecret
      , { status: "Scribblez: https://new-expression.herokuapp.com", media_ids: data.media_id_string}
      , function(err, data, response){
        if (err){
          console.log("ERROR:", err);
        }
        else {
          console.log(data);
          console.log("it worked");
        }
      });
    }
  );
}

function cb(data){
  console.log("first step " + data);
  io.emit("messagetype", "hi!");
  var params = {
     status: 'I am a tweet',
     media_ids:[data]
  }
}

function initTwitterPost(){
  var OAuth= require('oauth').OAuth;
  oA = new OAuth(
  "http://twitter.com/oauth/request_token",
  "http://twitter.com/oauth/access_token",
  config.consumer_key, config.consumer_secret,
  "1.0A", null, "HMAC-SHA1"
  );
}

server.listen(process.env.PORT || 3000);
console.log("server running");

io.sockets.on('connection', function(socket) {
  console.log('socket.io connected', socket.id);
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  socket.on ("google", function(data){
    console.log(data);
    var image = data.image.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(image, 'base64');
    console.log(buf);
    var timestamp = Date.now();
    img = fs.writeFile(__dirname + '/uploads/'+timestamp+'.jpg', buf, function(){console.log("done");
    var filename = "https://new-expression.herokuapp.com/uploads/"+timestamp+".jpg";
    socket.emit("googleReply", filename);
    console.log(filename);
    });
  });

  socket.on ("facebook", function(data){
    console.log(data);
    var image = data.image.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(image, 'base64');
    console.log(buf);
    var timestamp = Date.now();
    img = fs.writeFile(__dirname + '/uploads/'+timestamp+'.jpg', buf, function(){console.log("done");
    var filename = "uploads/"+timestamp+".jpg";
    socket.emit("facebookReply", filename);
    console.log(filename);
    });
  });

  socket.on ("twitter", function(data){
    var image = data.image.replace(/^data:image\/\w+;base64,/, "");
    twitterImage = image;
    var buf = new Buffer(image, 'base64');
    var timestamp = Date.now();
    img = fs.writeFile(__dirname + '/uploads/'+timestamp+'.jpg', buf, function(){console.log("done");
    var filename = "uploads/"+timestamp+".jpg";
    console.log(filename);
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
        user: '...',
        pass: '...'
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
