if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
	var viewportmeta = document.querySelector('meta[name="viewport"]');
	if (viewportmeta) {
	  viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0';
	  document.body.addEventListener('gesturestart', function () {
	    viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
	  }, false);
	}
}

window.onload = function() {
    setTimeout(function() { window.scrollTo(0, 1) }, 100);
}

function resizeCanvas(){
    var con = document.getElementById("container"),
        canvas = document.getElementById("canvas"),
        aspect = canvas.height/canvas.width,    
        width = con.offsetWidth,
        height = con.offsetHeight;
    
    canvas.width = width;
    canvas.height = Math.round(width * aspect);
}

window.onresize = resizeCanvas;
window.onload = resizeCanvas;