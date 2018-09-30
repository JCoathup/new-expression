let _menu = document.querySelector(".menu");
let _toolbox = document.querySelector(".toolbox");
let _pallette = document.querySelector(".pallette");
let _navigation = document.querySelector(".navigation");
let lastColour;
var socket = io.connect();
let timer = 0;
let screen = window.orientation;
//opens or closes main menu
function openMenu () {
  let _subMenu = document.querySelectorAll(".subMenu");
  for (let item of _subMenu){
    if (item.classList.contains("button--active")){
    // if menu already open then close main menu
    let _menuItems = document.querySelectorAll(".menuItems");
    for (let i=0; i<_menuItems.length; i++){
    _menuItems[i].classList.remove(".menuItems--active");
    }
    item.classList.remove("button--active");
    _pallette.innerHTML = "";
    }
  }
  //else menu is closed then open main menu
  _menu.classList.toggle('menu--active');
  _toolbox.classList.toggle('toolbox--active');
}
//opens submenu
function openPallette(){
  _pallette.classList.toggle('pallette--active');
  _navigation.classList.toggle('nav--move');
}
//checks if menu is already open - if so - does not close it and just replaces pallette innerHTML
function menuChecker(e){
  if (e.target && e.target.classList.contains("subMenu")) {
    let _subMenu = document.querySelectorAll(".subMenu");
    for (let item of _subMenu){
      if (item.classList.contains("button--active") && (item != e.target)){
        item.classList.remove("button--active");
        e.target.classList.toggle("button--active");
        return;
      }
    }
    e.target.classList.toggle("button--active");
    openPallette();
  }
}
//displays options for line thickness
function pencilThickness () {
  _pallette.innerHTML = "";
  _pallette.innerHTML = `<div class='pencilList'></div>`;
  let _pencilList = document.querySelector(".pencilList");
  let pencilArray = 6;
  let thickness = 1;
  for (let i=0; i<pencilArray; i++){
    _pencilList.innerHTML += `<div class="outer--container menuItems" data-thickness="${thickness}">
                              <div class="inner--container" data-thickness="${thickness}">
                                <div class="curve1" data-thickness="${thickness}" style="border:${thickness}px solid #000; border-color:transparent #000 #000 transparent; border-radius: 0px 0px 350px 350px;"></div>
                                <div class="curve2" data-thickness="${thickness}" style="border:${thickness}px solid #000; border-color:#000 transparent transparent #000; border-radius: 350px 450px 0px 0px; margin-left:-${thickness}px;"></div>
                              </div>
                            </div>`;
    thickness += 2;
  }
  let _menuItems = document.querySelectorAll(".menuItems");
  Animation(_menuItems);
}
//document Event Delegator
document.addEventListener("click", function(e){
  if ((e.target && e.target.className == "outer--container") || (e.target && e.target.className == "inner--container") || (e.target && e.target.className == "curve1") || (e.target && e.target.className == "curve2")) {
    radius = e.target.getAttribute("data-thickness");
  }
  if (e.target && e.target.classList.contains("menu")){
    //check if erase functionality running
    resetErase(lastColour);
    if (_pallette.classList.contains("pallette--active")){
      _pallette.classList.remove("pallette--active");
      _navigation.classList.remove("nav--move");
    }
    openMenu();
  }
  if (e.target && e.target.id == "background"){
    menuChecker(e);
    colourPicker();
  }
  if (e.target && e.target.id == "clear"){
    clrscreen();
  }
  if (e.target && e.target.id == "erase"){
    erase();
  }
  if (e.target && e.target.id == "endErase"){
    resetErase(lastColour);
  }
  //selects stroke colour or background depending on which menu has been selected
  if (e.target && e.target.classList.contains("colour")){
    let background = document.querySelector("#background");
    if (background.classList.contains("button--active")){
      _canvas.style.backgroundColor = e.target.id;
    }
    let _colour = document.querySelector("#colour");
    if (_colour.classList.contains("button--active")){
      context.fillStyle = e.target.id;
      context.strokeStyle = e.target.id;
      lastColour = e.target.id;
    }
  }
  if (e.target && e.target.id == "colour") {
    menuChecker(e);
    colourPicker();
  }
  if (e.target && e.target.id == "pencil"){
    menuChecker(e);
    pencilThickness();
  }
  if (e.target && e.target.id == "share"){
    menuChecker(e);
    _pallette.innerHTML = "";
    _pallette.innerHTML = `<ul class='shareList'></ul>`
    let _shareList = document.querySelector(".shareList");
    let shareArray = 4;
    _shareList.innerHTML += `<li><button class='share icofont icofont-download menuItems' title="download" id="download" style='font-size:84px; color: #fff; background-color: #e6d068;'></button></li>
                            <li><button title = "email" class='share icofont icofont-email menuItems' id="email" style='font-size:84px; color: #fff; background-color: #ff802c;'></button></li>
                            <li><button class='share icofont icofont-social-facebook menuItems'id="facebook" style='font-size:84px; color:#fff; background-color: #3b5998;'></button></li>
                            <li><a href="/twitter" target="_blank"><button class='share icofont icofont-social-twitter menuItems' id='tweet' style='font-size:84px; color:#fff; background-color: #0084B4;'></button></a></li>
                            <li><button class='share icofont icofont-social-whatsapp menuItems' style='font-size:84px; color:#fff; background-color: #1ebea5;'></button></li>`;
    let _menuItems = document.querySelectorAll(".menuItems");
    Animation(_menuItems);
  }
  if (e.target && e.target.id == "facebook"){
    let facebookData = {};
    let bgd = _canvas.style.backgroundColor;
    facebookData.image = canvasToImage(bgd);
    var source;
    FB.login(function(response){
    console.log(response);
    console.log("now we are connected");
    socket.emit("facebook", facebookData);
    socket.on("facebookReply", function(data){
      console.log(data);
      source = data;
      uploadFacebook(source);
    })

    });
  }
  if (e.target && e.target.id == "download"){
    _pallette.classList.remove("pallette--active");
    openMenu();
    _navigation.classList.remove('nav--move');
    let link = document.createElement('a');
    let bgd = _canvas.style.backgroundColor;
    let filename = Date.now();
    let img = canvasToImage(bgd);
    link.href = img;
    link.setAttribute("download", filename + ".jpg");
    if (_canvas.msToBlob) { //for IE
     var blob = _canvas.msToBlob();
     window.navigator.msSaveBlob(blob, filename + '.jpg');
    } else{
      doClick(link);
    }
  }
  if(e.target && e.target.classList.contains("lightbox")){
    let _lightbox = document.querySelector(".lightbox");
    _lightbox.classList.toggle("lightbox-target");
  }
  if (e.target && e.target.id == "email"){
    _pallette.classList.remove("pallette--active");
    openMenu();
    _navigation.classList.remove('nav--move');
    let bgd = _canvas.style.backgroundColor;
    let variable = canvasToImage(bgd);
    let _lightbox = document.querySelector(".lightbox");
    _lightbox.classList.toggle("lightbox-target");
    _lightbox.innerHTML = `<aside class = "lightbox-inner" style="padding:1%;">
                          <input id="emailAddress" type="text" placeholder="email"><br>
                          <input id="comment" type="textarea" placeholder="message"><br>
                          <button id="sendEmail">EMAIL</button>
                          <button id="cancelEmail">CANCEL</button>
                          </aside>`
  }
  if (e.target && e.target.id == "cancelEmail"){
    let bgd = _canvas.style.backgroundColor;
    let img = new Image();
    img.src = canvasToImage(bgd);
    let _lightbox = document.querySelector(".lightbox");
    _lightbox.classList.toggle("lightbox-target");
    context.drawImage(img,0,0);
  }
  if (e.target && e.target.id == "sendEmail"){
    _pallette.classList.remove("pallette--active");
    _navigation.classList.remove('nav--move');
    let data = {}
    data.emailAddress = document.querySelector("#emailAddress").value;
    data.comment = document.querySelector("#comment").value;
    let bgd = _canvas.style.backgroundColor
    data.image = canvasToImage(bgd);
    socket.emit("email", data);
    let _lightbox = document.querySelector(".lightbox");
    _lightbox.classList.toggle("lightbox-target");
  }
  if (e.target && e.target.id == "tweet"){
    tweet();
  }
  if (e.target && e.target.id == "sendTweet"){
    sendingTweet();
  }
});
//displays colours for line and background
function colourPicker (){
  _pallette.innerHTML = "";
  _pallette.innerHTML = `<ul class='colourList'></ul>`;
  let _colourList = document.querySelector(".colourList");
  let colourArray = ["#ffffff", "#fff8c6", "#ffff00", "#ffd700", "#b1bb17", "#008000", "#006400", "#82caff", "#0000cd", "#191970", "#ffa500", "#f88017", "#ff7f50", "#ff0000", "#8b0000", "#faafba", "#f660ab", "#ff1493", "#c45aec", "#8b008b", "#800080", "#e2a76f", "#806517", "#8b4513", "#999999", "#666666", "#333333", "#000000"];
  for (let colour of colourArray){
    _colourList.innerHTML += `<li><button id = ${colour} class='colour menuItems' style='background-color: ${colour}'></button></li>`;
  }
  let _menuItems = document.querySelectorAll(".menuItems");
  Animation(_menuItems);
}
// mouse click to begin drawing
document.addEventListener("mousedown", function(e){
  if(e.target && e.target.id == "canvas"){
    engage(e);
  }
});
// moving mouse to draw
document.addEventListener("mousemove", function(e){
  if(e.target && e.target.id == "canvas"){
    putPoint(e);
  }
});
// release mouse click to stop drawing
document.addEventListener("mouseup", function(e){
  if (e.target && e.target.id == "canvas"){
    disengage(e);
  }
});
// Set up touch events for mobile, etc
document.addEventListener("touchstart", function(e){
  e.preventDefault();
  e.stopPropagation();
  if (e.target && e.target.id == "canvas"){
    document.body.style.overflow = "hidden";
    e.preventDefault();
    putPoint(e);
    engage(e);
  }
}, false);
// Move finger to draw
document.addEventListener("touchmove", function(e){
  e.preventDefault();
  e.stopPropagation();
  if (e.target && e.target.id == "canvas"){
    e.preventDefault();
    if (!e)
        var e = event;
    if (e.touches) {
      e.preventDefault();
        if (e.touches.length == 1) { // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            touchX=touch.pageX-touch.target.offsetLeft;
            touchY=touch.pageY-touch.target.offsetTop;
        }
    }
    context.lineWidth = radius*2;
    context.lineTo(touchX, touchY);
    context.stroke();
    context.beginPath();
    context.arc(touchX, touchY, radius, 0, Math.PI*2);
    context.fill();
    context.beginPath();
    context.moveTo(touchX, touchY);
    e.preventDefault();
  }
}, false);
//removing finger from screen - disable touch
document.addEventListener("touchend", function(e){
  if (e.target && e.target.id == "canvas"){
    document.body.style.overflow = "auto";
    disengage(e);
  }
}, false);
//actual program begins here

let _canvas = document.querySelector("#canvas");
let context = _canvas.getContext("2d");
_canvas.setAttribute("width", window.innerWidth);
_canvas.setAttribute("height", window.innerHeight);
_canvas.style.backgroundColor = "#000000";
context.fillStyle = '#ffffff';
context.strokeStyle = '#ffffff';
let radius = 1;
let dragging = false;
//detect mouse position and draw lines
function putPoint(e){
  if(dragging){
    context.lineWidth = radius;
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
    context.beginPath();
    context.arc(e.offsetX, e.offsetY, radius/2, 0, Math.PI*2);
    context.fill();
    context.beginPath();
    context.moveTo(e.offsetX, e.offsetY);
  }
}
//ensures drawing occurs only after mouse click
function engage (e){
  dragging = true;
  putPoint(e);
}
//ensures drawing stops after mouse click released
function disengage (){
  dragging = false;
  context.beginPath();
}
//clear screen contents
function clrscreen(){
  document.location.reload();
  openMenu();
  _pallette.classList.remove('pallette--active');
  _navigation.classList.remove('nav--move');
  context.clearRect(0, 0, _canvas.width, _canvas.height);
  _canvas.style.backgroundColor = '#000000';
  radius = 1;
  context.fillStyle = '#ffffff';
  context.strokeStyle = '#ffffff';
}
//erase functionality
function erase (){
  let _eraseButton = document.querySelector(".eraseButton");
  _eraseButton.innerHTML += `<button id="endErase">Stop Erasing</button>`;
  lastColour = context.strokeStyle;
  openMenu();
  _pallette.classList.remove('pallette--active');
  _navigation.classList.remove('nav--move');
  context.globalCompositeOperation = "destination-out";
  context.strokeStyle = _canvas.style.backgroundColor;
  context.fillStyle = _canvas.style.backgroundColor;
}
//resets colours after erase ended
function resetErase (col){
  document.querySelector(".eraseButton").innerHTML = "";
  context.globalCompositeOperation = "source-over";
  context.fillStyle = col;
  context.strokeStyle = col;
}
//saves canvas drawing as png and also uses the current canvas background colour
function canvasToImage(backgroundColor)
{
//cache height and width
  var w = _canvas.width;
 	var h = _canvas.height;
 	var data;
 	if(backgroundColor)
 	{
 		//get the current ImageData for the canvas.
 		data = context.getImageData(0, 0, w, h);
 		//store the current globalCompositeOperation
 		var compositeOperation = context.globalCompositeOperation;
 		//set to draw behind current content
 		context.globalCompositeOperation = "destination-over";
 		//set background color
 		context.fillStyle = backgroundColor;
 		//draw background / rect on entire canvas
 		context.fillRect(0,0,w,h);
 	}
 	//get the image data from the canvas
 	var imageData = this.canvas.toDataURL("image/jpeg");
 	if(backgroundColor)
 	{
 		//clear the canvas
 		context.clearRect (0,0,w,h);
 		//restore it with original / cached ImageData
 		context.putImageData(data, 0,0);
 		//reset the globalCompositeOperation to what it was
 		context.globalCompositeOperation = compositeOperation;
 	}
 	//return the Base64 encoded data url string
 	return imageData;
 }
window.addEventListener("resize", canvasResize, false);
window.addEventListener("orientationchange", OrientationshiftNew, false);

function canvasResize(){
  resetErase(lastColour);
  let ink = context.fillStyle;
  let tempCanvas = document.createElement('canvas');
  tempCanvas.width = _canvas.width;
  tempCanvas.height = _canvas.height;
  let scale = Math.min(_canvas.width / tempCanvas.width, _canvas.height / tempCanvas.height);
  let x = (_canvas.width / 2) - (tempCanvas.width / 2) * scale;
  let y = (_canvas.height / 2) - (tempCanvas.height / 2) * scale;
  tempCanvas.getContext('2d').drawImage(canvas, 0, 0);
  _canvas.setAttribute("width", window.innerWidth);
  _canvas.setAttribute("height", window.innerHeight);
  if (tempCanvas.width > _canvas.width || tempCanvas.height > _canvas.height){
    _canvas.setAttribute("width", tempCanvas.width);
    _canvas.setAttribute("height", tempCanvas.height);
    console.log("BIGGER");
    let scale = Math.max(tempCanvas.width / _canvas.width, tempCanvas.height / _canvas.height);
    _canvas.getContext('2d').drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
    context.fillStyle = ink;
    context.strokeStyle = ink;
    return;
  }
  console.log("SMALLER");
  _canvas.getContext('2d').drawImage(tempCanvas, x, y, tempCanvas.width*scale, tempCanvas.height*scale);
  context.fillStyle = ink;
  context.strokeStyle = ink;
}
//handles device rotation
function drawRotated(degrees){
  console.log(degrees);
  context.clearRect(0,0,_canvas.width,_canvas.height);
  context.save();
  _canvas.setAttribute("width", window.innerHeight*window.devicePixelRatio);
  _canvas.setAttribute("height", window.innerWidth);
  context.translate(_canvas.width/2,_canvas.height/2);
  context.rotate(degrees*Math.PI/180);
  context.drawImage(tempCanvas,-tempCanvas.width/2,-tempCanvas.height/2);
  context.restore();
}
//handles 180 rotation
function drawRotated180(degrees){
  console.log(degrees);
  context.clearRect(0,0,_canvas.width,_canvas.height);
  context.save();
  //canvas.setAttribute("width", window.innerHeight*window.devicePixelRatio);
  //canvas.setAttribute("height", window.innerWidth*window.devicePixelRatio);
  //context.translate(-canvas.width/2,-canvas.height/2);
  context.rotate(degrees*Math.PI/180);
  context.drawImage(tempCanvas,-tempCanvas.width,-tempCanvas.height);
  context.restore();
}
//handles pallette animations
function Animation(item){
    for (let i=0; i < item.length; i++){
    menuAnimation(i);
    }
    timer = 0;
    function menuAnimation(i){
      timer += 100;
      setTimeout(function(){
      item[i].classList.toggle("menuItems--active");
    },(100 + timer));
    }
}
//handles image download functionality
function doClick(obj) {
  try {
    let evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window,0, 0, 0, 0, 0,
      false, false, false, false, 0, null);
      let canceled = !obj.dispatchEvent(evt);
      if(canceled) {
      // A handler called preventDefault
      } else {
      // None of the handlers called preventDefault
    }
  } catch(er) {
    obj.click(); //IE
}
}
//handles device rotation
function OrientationshiftNew(){
  //var lastColour = context.strokeStyle;
    let ink = context.fillStyle;
  resetErase(lastColour);
  let angleInDegrees=screen;
  tempCanvas = document.createElement('canvas');
  tempContext = tempCanvas.getContext('2d');
  tempCanvas.width = _canvas.width;
  tempCanvas.height = _canvas.height;
  tempContext.drawImage(_canvas, 0, 0);
  if (screen == 0){
    switch(window.orientation){
      case -90:
        angleInDegrees=90;
        drawRotated(angleInDegrees);
        screen+=-90;
      break;
      case 90:
        angleInDegrees=-90;
        drawRotated(angleInDegrees);
        screen+=90;
      break;
      default:
      console.log("done");
    }
    }
  if (screen == -90){
    switch(window.orientation){
      case 0:
        angleInDegrees=-90;
        drawRotated(angleInDegrees);
        screen+=90;
      break;
      case 90:
        angleInDegrees=-180;
        drawRotated180(angleInDegrees);
        screen+=180;
      break;
      default:
      console.log("done");
    }
  }
  if (screen == 90){
    switch(window.orientation){
      case 0:
        angleInDegrees=90;
        drawRotated(angleInDegrees);
        screen+=-90;
        break;
      case -90:
        angleInDegrees=180;
        drawRotated180(angleInDegrees);
        screen-=180;
        break;
      default:
      console.log("done");
    }
  }
  context.fillStyle = ink;
  context.strokeStyle = ink;
}

//handles tweet functionality
function tweet () {
  let _lightbox = document.querySelector(".lightbox");
  _lightbox.classList.toggle("lightbox-target");
  _lightbox.innerHTML = `<aside class = "lightbox-inner" style="padding:1%;">
                        <textarea id="tweetContent" maxlength="140">#Scribblez...</textarea>
                        <button id="sendTweet">TWEET</button>
                        <button id="cancelTweet">CANCEL</button>
                        </aside>`;
}
//sending a tweet
function sendingTweet () {
  let tweetData = {};
  tweetData.tweetContent = document.querySelector("#tweetContent").value;
  console.log("got it" + document.querySelector("#tweetContent").value);
  let bgd = _canvas.style.backgroundColor;
  tweetData.image = canvasToImage(bgd);
  socket.emit('dispatch', tweetData);
}

function uploadFacebook (data){
  var meta = document.createElement('meta');
meta.property = "og:image:width";
meta.content = window.innerWidth;
document.getElementsByTagName('head')[0].appendChild(meta);
 FB.ui({
  method: 'share_open_graph',
  href: 'https://new-expression.herokuapp.com/'+data,
  url: 'https://new-expression.herokuapp.com'+data,
  picture: 'https://new-expression.herokuapp.com/'+data,
  action_type: 'og.shares',
  action_properties: JSON.stringify({
      object: {
        'og:title': 'Scribblez',
        'og:site_name': 'https://new-expression.herokuapp.com',
        'og:url': 'https://new-expression.herokuapp.com/'+data,
        'og:description': 'Say something, by drawing something',
        'fb:app_id': '519899595123870',
        'og:image': 'https://new-expression.herokuapp.com/'+data,
        'og:image:type': 'image/jpeg',
        'og:image:width': window.innerWidth,
        'og:image:height': window.innerHeight
      }
  })
}, function(response){
  console.log(response);
});
/* FB.ui(
  {
    method: 'feed',
    name: 'Scribblez',
    href: 'https://new-expression.herokuapp.com',
    picture: "https://new-expression.herokuapp.com/" + data,
    caption: "Say something by drawing it"
  }
); */
}
