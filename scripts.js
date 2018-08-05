let menu = document.querySelector(".menu");
let toolbox = document.querySelector(".toolbox");
let pallette = document.querySelector(".pallette");
let navigation = document.querySelector(".navigation");
let lastColour;
function openMenu () {
  let subMenu = document.querySelectorAll(".subMenu");
  for (let item of subMenu){
    if (item.classList.contains("button--active")){
    // if menu already open then close main menu
    item.classList.remove("button--active");
    pallette.innerHTML = "";
    }
  }
  //else menu is closed then open main menu
  menu.classList.toggle('menu--active');
  toolbox.classList.toggle('toolbox--active');
}

function openPallette(){
  pallette.classList.toggle('pallette--active');
  navigation.classList.toggle('nav--move');
}

//checks if menu is already open - if so - does not close it and just replaces pallette innerHTML
function menuChecker(e){
  if (e.target && e.target.classList.contains("subMenu")) {
    let subMenu = document.querySelectorAll(".subMenu");
    for (let item of subMenu){
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

function pencilThickness () {
  pallette.innerHTML = "";
  pallette.innerHTML = `<div class='pencilList'></div>`;
  let pencilList = document.querySelector(".pencilList");
  let pencilArray = 6;
  let thickness = 1;
  for (let i=0; i<pencilArray; i++){
    pencilList.innerHTML += `<div class="outer--container" data-thickness="${thickness}">
                              <div class="inner--container" data-thickness="${thickness}">
                                <div class="curve1" data-thickness="${thickness}" style="border:${thickness}px solid #000; border-color:transparent #000 #000 transparent; border-radius: 0px 0px 350px 350px;"></div>
                                <div class="curve2" data-thickness="${thickness}" style="border:${thickness}px solid #000; border-color:#000 transparent transparent #000; border-radius: 350px 450px 0px 0px; margin-left:-${thickness}px;"></div>
                              </div>
                            </div>`;
    thickness += 2;
  }
}

//document Event Delegator
document.addEventListener("click", function(e){
  if ((e.target && e.target.className == "outer--container") || (e.target && e.target.className == "inner--container") || (e.target && e.target.className == "curve1") || (e.target && e.target.className == "curve2")) {
    //resetErase(lastColour);
    radius = e.target.getAttribute("data-thickness");
  }
  if (e.target && e.target.classList.contains("menu")){
    if (pallette.classList.contains("pallette--active")){
      pallette.classList.remove("pallette--active");
      navigation.classList.remove("nav--move");
    }
    openMenu();
  }
  if (e.target && e.target.id == "background"){
    //resetErase(lastColour);
    menuChecker(e);
    colourPicker();
  }
  if (e.target && e.target.id == "clear"){
    //resetErase(lastColour);
    clrscreen();
  }
  if (e.target && e.target.id == "erase"){
    erase();
  }
  if (e.target && e.target.id == "endErase"){
    resetErase(lastColour);
  }
  //selects stroke colour or background depending on which menu has been selected
  if (e.target && e.target.className == "colour"){
    //resetErase(lastColour);
    let background = document.querySelector("#background");
    if (background.classList.contains("button--active")){
      canvas.style.backgroundColor = e.target.id;
      //updateEraseHistory()
    }
    let colour = document.querySelector("#colour");
    if (colour.classList.contains("button--active")){
      context.fillStyle = e.target.id;
      context.strokeStyle = e.target.id;
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
    pallette.innerHTML = "";
    pallette.innerHTML = `<ul class='shareList'></ul>`
    let shareList = document.querySelector(".shareList");
    let shareArray = 4;
    shareList.innerHTML += `<li><button class='share icofont icofont-email' style='font-size:84px; color: #fff; background-color: #ff802c;'></button></li>
                            <li><button class='share icofont icofont-social-facebook' style='font-size:84px; color:#fff; background-color: #3b5998;'></button></li>
                            <li><button class='share icofont icofont-social-twitter' id='tweet' style='font-size:84px; color:#fff; background-color: #0084B4;'></button></li>
                            <li><button class='share icofont icofont-social-whatsapp' style='font-size:84px; color:#fff; background-color: #1ebea5;'></button></li>`;
  }
  if (e.target && e.target.id == "tweet"){
    let bgd = canvas.style.backgroundColor;
    let variable = canvasToImage(bgd);
    console.log(variable);
    let lightbox = document.querySelector(".lightbox");
    lightbox.classList.toggle("lightbox-target");
    lightbox.innerHTML = `<div class = "lightbox-inner" style="padding:1%;">
                          <img src=${variable}><br>
                          <input type="text"><br>
                          <button id="sendTweet">TWEET</button>
                          <button id="cancelTweet">CANCEL</button>
                          </div>`
  }
  if (e.target && e.target.id == "cancelTweet"){
    let bgd = canvas.style.backgroundColor;
    let img = new Image();
    img.src = canvasToImage(bgd);
    let lightbox = document.querySelector(".lightbox");
    lightbox.classList.toggle("lightbox-target");
    context.drawImage(img,0,0);
  }
});

function colourPicker (){
  pallette.innerHTML = "";
  pallette.innerHTML = `<ul class='colourList'></ul>`;
  let colourList = document.querySelector(".colourList");
  let colourArray = ["#ffffff", "#fff8c6", "#ffff00", "#ffd700", "#b1bb17", "#008000", "#006400", "#82caff", "#0000cd", "#191970", "#ffa500", "#f88017", "#ff7f50", "#ff0000", "#8b0000", "#faafba", "#f660ab", "#ff1493", "#c45aec", "#8b008b", "#800080", "#e2a76f", "#806517", "#8b4513", "#999999", "#666666", "#333333", "#000000"];
   for (let colour of colourArray){
     colourList.innerHTML += `<li><button id = ${colour} class='colour' style='background-color: ${colour}'></button></li>`;
   }
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
//window.addEventListener("touchstart", function(e) {    e.preventDefault();}, false);window.addEventListener("touchmove", function(e) {    e.preventDefault();}, false);
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
document.addEventListener("touchend", function(){
  if (e.target && e.target.id == "canvas"){
    document.body.style.overflow = "auto";
    disengage(e);
  }
}, false);

let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = "#000000";
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
  openMenu();
  pallette.classList.remove('pallette--active');
  navigation.classList.remove('nav--move');
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.backgroundColor = '#000000';
  radius = 1;
  context.fillStyle = '#ffffff';
  context.strokeStyle = '#ffffff';
}

function erase (){
  let eraseButton = document.querySelector(".eraseButton");
  eraseButton.innerHTML += `<button id="endErase">Stop Erasing</button>`;
  lastColour = context.strokeStyle;
  openMenu();
  pallette.classList.remove('pallette--active');
  navigation.classList.remove('nav--move');
  context.globalCompositeOperation = "destination-out";
  context.strokeStyle = "rgba(0,0,0,1)";
}
 function resetErase (col){
   document.querySelector(".eraseButton").innerHTML = "";
   context.globalCompositeOperation = "source-over";
   context.fillStyle = col;
   context.strokeStyle = col;
 }
 //saves canvas drawing as png and also uses the current canvas background colour
 function canvasToImage(backgroundColor)
 {
  console.log(backgroundColor);
 	//cache height and width
 	var w = canvas.width;
 	var h = canvas.height;
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
window.addEventListener("resize", resizeCanvas, false);
//window.addEventListener("orientationchange", resizeCanvas, false);

function resizeCanvas(){
  var myCanvas=document.getElementById("canvas");
var ctx=myCanvas.getContext("2d");
var cw=canvas.width;
var ch=canvas.height;
var tempCanvas=document.createElement("canvas");
var tctx=tempCanvas.getContext("2d");
let ink = context.fillStyle;
let bgd = tempCanvas.style.backgroundColor;
var img=new Image();
img.crossOrigin='anonymous';
img.onload=start;
img.src = canvasToImage(bgd);

function start(){
  myCanvas.width=img.width;
  myCanvas.height=img.height;
  ctx.drawImage(img,0,0);
  resizeTo(myCanvas,0.50);
}

function resizeTo(canvas,pct){
  var cw=canvas.width;
  var ch=canvas.height;
  tempCanvas.width=cw;
  tempCanvas.height=ch;
  tctx.drawImage(canvas,0,0);
  canvas.width*=pct;
  canvas.height*=pct;
  var ctx=canvas.getContext('2d');
  ctx.drawImage(tempCanvas,0,0,cw,ch,0,0,cw*pct,ch*pct);
}
}
