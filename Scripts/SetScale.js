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

function resize() {
  var canvasRatio = canvas.height / canvas.width;
  var windowRatio = window.innerHeight / window.innerWidth;
  var width;
  var height;

  if (windowRatio < canvasRatio) {
    height = window.innerHeight;
    width = height / canvasRatio;
  } else {
    width = window.innerWidth;
    height = width * canvasRatio;
  }

  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  
  if (resolution_select.value == "auto") {
    if (window.innerWidth >= 2560) {
      canvas.width = 2560;
      canvas.height = 1440;
      scale = 2;
    } else if (window.innerWidth >= 1920) {
      canvas.width = 1920;
      canvas.height = 1080;
      scale = 1.5;
    } else if (window.innerWidth >= 1366 && window.innerHeight >= 768  && window.innerWidth < 1920 && fps > 30) {
      canvas.width = 1366;
      canvas.height = 768;
      scale = 1.0671875;
    } else if (window.innerWidth >= 1280 && window.innerHeight >= 720 && window.innerWidth < 1366 && fps > 30) {
      canvas.width = 1280;
      canvas.height = 720;
      scale = 1;
    }
    if (window.innerWidth >= 640 && window.innerHeight >= 360 && window.innerWidth < 1280) {
      canvas.width = 640;
      canvas.height = 360;
      scale = 0.5;
    }
  }
  if (resolution_select.value == "1440") {
    canvas.width = 2560;
    canvas.height = 1440;
    scale = 2;
  }
  if (resolution_select.value == "1080") {
    canvas.width = 1920;
    canvas.height = 1080;
    scale = 1.5;
  }
  if (resolution_select.value == "768") {
    canvas.width = 1366;
    canvas.height = 768;
    scale = 1.0671875;
  }
  if (resolution_select.value == "720") {
    canvas.width = 1280;
    canvas.height = 720;
    scale = 1;
  }
  if (resolution_select.value == "360") {
    canvas.width = 640;
    canvas.height = 360;
    scale = 0.5;
  }
  if (resolution_select.value == "180") {
    canvas.width = 320;
    canvas.height = 180;
    scale = 0.25;
  }
};
window.addEventListener('resize', resize, false);
window.onload = resize;
