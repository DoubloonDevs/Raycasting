function Water() {}
Water.prototype.run = function() {
  for (var i = 0; i < springs.length; i++) {
    if (i === 0) { // wrap to left-to-right
      var dy0 = springs[springs.length - 1].y - springs[i].y;
      springs[i].forceFromLeft = springs[i].k * dy0;
    } else { // normally
      var dy1 = springs[i - 1].y - springs[i].y;
      springs[i].forceFromLeft = springs[i].k * dy1;
    }
    if (i == springs.length - 1) { // wrap to right-to-left
      var dy2 = springs[0].y - springs[i].y;
      springs[i].forceFromRight = springs[i].k * dy2;
    } else { // normally
      var dy3 = springs[i + 1].y - springs[i].y;
      springs[i].forceFromRight = springs[i].k * dy3;
    }
    var dy4 = springs[i].targetHeight - springs[i].y;
    springs[i].forceToBaseline = springs[i].k * dy4;
    springs[i].update();
  }
};

function Spring(x, y) {
  this.x = x;
  this.y = y;
  this.vely = 0;
  this.height = y;
  this.targetHeight = y;
  this.k = 0.025;
  this.dx = 0;
  this.acceleration = 0;
  
  this.forceFromLeft = 0;
  this.forceFromRight = 0;
  this.forceToBaseline = 0;
}
Spring.prototype.update = function() {
  var force = 0;
  force += this.forceFromLeft;
  force += this.forceFromRight;
  force += this.forceToBaseline;
  var acceleration = force / 0.25;
  this.vely = 0.875 * this.vely + acceleration;
  this.y += this.vely;
  c.fillStyle = 'rgba(130, 130, 200, 0.5)';
  c.beginPath();
  c.moveTo(this.x, this.y);
  c.lineTo(this.x+32, this.y);
  c.lineTo(this.x+32, height);
  c.lineTo(this.x, height);
  c.closePath();
  c.fill();  
};