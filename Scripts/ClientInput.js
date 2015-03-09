var canvas = document.getElementById("myCanvas");
window.scrollTo(0,1);
if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
  if (document.cookie.indexOf("iphone_redirect=false") == -1) window.location = "http://m.espn.go.com/wireless/?iphone&i=COMR";
  document.ontouchstart = touchStart;
  function touchStart(e){
    e.preventDefault();
    touchX = e.pageX;
    touchY = e.pageY;
    if (touchY < height/2) upPressed = true;
    if (touchX < width/2 && touchY > height/2) leftPressed = true;
    if (touchX > width/2 && touchY > height/2) rightPressed = true;
  }
  document.ontouchmove = touchMove;
  function touchMove(e){
    e.preventDefault();
    touchX = e.pageX;
    touchY = e.pageY;
    if (touchY < height/2) upPressed = true;
    //else upPressed = false;
    if (touchX < width/2 && touchY > height/2) leftPressed = true;
    //else rightPressed = false;
    if (touchX > width/2 && touchY > height/2) rightPressed = true;
    //else leftPressed = false;
  }
  document.ontouchend = touchEnd;
  function touchEnd(e) {
    e = e || window.event;
    e.preventDefault();
    //upPressed = false;
    //leftPressed = false;
    //rightPressed = false;
  }
}

document.onkeydown = keyPressed;
function keyPressed(e) {
  e = e || window.event;
  if (e.keyCode == 87) upPressed = true;
  if (e.keyCode == 65) leftPressed = true;
  if (e.keyCode == 83) downPressed = true;
  if (e.keyCode == 68) rightPressed = true;
}
document.onkeyup = keyReleased;
function keyReleased(e) {
  e = e || window.event;
  if (e.keyCode == 87) upPressed = false;
  if (e.keyCode == 65) leftPressed = false;
  if (e.keyCode == 83) downPressed = false;
  if (e.keyCode == 68) rightPressed = false;
}

document.onmousedown = mousePressed;
function mousePressed(e) {}
document.onmouseup = mouseReleased;
function mouseReleased(e) {}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

canvas.addEventListener('mousemove', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  this.mouseX = mousePos.x;
  this.mouseY = mousePos.y;
}, true);