function Light(x, y, r, g, b, intensity) {
  this.x = x;
  this.y = y;
  this.width = 4;
  this.height = 4;
  this.r = r;
  this.g = g;
  this.b = b;
  this.intensity = intensity;
  this.polygons = [];
}
Light.prototype.drawShadows = function(r, g, b) {
  for (var i = 0; i < map_length; i += canvas.width) {
    c.fillStyle = 'rgb('+(this.r-10)+', '+(this.g-10)+', '+(this.b-10)+')';
    c.fillRect(i, 0, width, height);
  }
};
Light.prototype.run = function() {
  var segments = [
    //BORDER
    {a:{x:0,y:0}, b:{x:map_length,y:0}},
    {a:{x:map_length,y:0}, b:{x:map_length,y:height}},
    {a:{x:map_length,y:height}, b:{x:0,y:height}},
    {a:{x:0,y:height}, b:{x:0,y:0}},
  
    //PLAYER
    {a:{x:player.x,y:player.y},b:{x:player.x + player.width,y:player.y}},
    {a:{x:player.x+player.width,y:player.y},b:{x:player.x+player.width,y:player.y+player.height}},
    {a:{x:player.x+player.width,y:player.y+player.height},b:{x:player.x,y:player.y+player.width}},
    {a:{x:player.x,y:player.y+player.height},b:{x:player.x,y:player.y}},

    //MAP
    {a:{x:  0,y:800},b:{x:576,y:800}},
    {a:{x:576,y:800},b:{x:576,y:900}},
    {a:{x:576,y:900},b:{x:  0,y:800}},
    {a:{x:  0,y:800},b:{x:  0,y:800}},

    {a:{x: 770,y:800},b:{x:1600,y:800}},
    {a:{x:1600,y:800},b:{x:1600,y:900}},
    {a:{x:1600,y:900},b:{x: 770,y:800}},
    {a:{x: 770,y:800},b:{x: 770,y:800}},

    {a:{x: 928,y:704},b:{x:1344,y:704}},
    {a:{x:1344,y:706},b:{x:1344,y:800}},
    {a:{x:1344,y:800},b:{x: 928,y:704}},
    {a:{x: 928,y:704},b:{x: 928,y:704}},
  ];
  // Get all unique points
  var points = (function(segments){
    var a = [];
    segments.forEach(function(seg){
      a.push(seg.a,seg.b);
    });
    return a;
  })(segments);
  var uniquePoints = (function(points){
    var set = {};
    return points.filter(function(p){
      var key = p.x+","+p.y;
      if(key in set){
        return false;
      }else{
        set[key]=true;
        return true;
      }
    });
  })(points);

  // Get all angles
  var uniqueAngles = [];
  for(var j=0;j<uniquePoints.length;j++){
    var uniquePoint = uniquePoints[j];
    var angle = Math.atan2(uniquePoint.y-this.y,uniquePoint.x-this.x);
    uniquePoint.angle = angle;
    uniqueAngles.push(angle-0.00001,angle,angle+0.00001);
  }

  // RAYS IN ALL DIRECTIONS
  var intersects = [];
  for(var j=0;j<uniqueAngles.length;j++){
    var angle = uniqueAngles[j];

    // Calculate dx & dy from angle
    var dx = Math.cos(angle);
    var dy = Math.sin(angle);

    // Ray from center of screen to mouse
    var ray = {
      a:{x:this.x,y:this.y},
      b:{x:this.x+dx,y:this.y+dy}
    };

    // Find CLOSEST intersection
    var closestIntersect = null;
    for(var i=0;i<segments.length;i++){
      var intersect = this.getIntersection(ray,segments[i]);
      if(!intersect) continue;
      if(!closestIntersect || intersect.param<closestIntersect.param){
        closestIntersect=intersect;
      }
    }

    // Intersect angle
    if(!closestIntersect) continue;
    closestIntersect.angle = angle;

    // Add to list of intersects
    intersects.push(closestIntersect);

  }

  // Sort intersects by angle
  intersects = intersects.sort(function(a,b){
    return a.angle-b.angle;
  });

  // DRAW AS A GIANT POLYGON
  var grd = c.createRadialGradient(this.x, this.y, 5, this.x, this.y, 750*2);
  grd.addColorStop(0, 'rgba('+(this.r+72)+', '+(this.g+72)+', '+(this.b+72)+', '+(this.intensity)+')');
  grd.addColorStop(1, 'rgba('+(this.r)+', '+(this.g)+', '+(this.b)+', '+(this.intensity)+')');
  c.fillStyle = grd;
  //c.fillStyle = 'rgba('+(this.r+20)+', '+(this.g+20)+', '+(this.b+20)+', '+(this.intensity)+')';
  c.beginPath();
  c.moveTo(intersects[0].x,intersects[0].y);
  for(var i=1;i<intersects.length;i++){
    var intersect = intersects[i];
    c.lineTo(intersect.x,intersect.y);
  }
  c.fill();
  // DRAW DEBUG LINES
  if (debug) {
    c.strokeStyle = 'rgba('+(this.r+72)+', '+(this.g+72)+', '+(this.b+72)+', '+(this.intensity)+')';
    for(var i=0;i<intersects.length;i++){
      var intersect = intersects[i];
      c.beginPath();
      c.moveTo(this.x,this.y);
      c.lineTo(intersect.x,intersect.y);
      c.stroke();
    }
    c.drawImage(lightbulb, this.x-26, this.y-26, 53, 53);
  }
};
setLightColour = function(r, g, b, time) {
  for (var i = 0; i < lights.length; i++) {
    lights[i].r = r;
    lights[i].g = g;
    lights[i].b = b;
  }
};
Light.prototype.getIntersection = function(ray, segment){
  // RAY in parametric: Point + Delta*T1
  var r_px = ray.a.x;
  var r_py = ray.a.y;
  var r_dx = ray.b.x-ray.a.x;
  var r_dy = ray.b.y-ray.a.y;

  // SEGMENT in parametric: Point + Delta*T2
  var s_px = segment.a.x;
  var s_py = segment.a.y;
  var s_dx = segment.b.x-segment.a.x;
  var s_dy = segment.b.y-segment.a.y;

  // Are they parallel? If so, no intersect
  var r_mag = Math.sqrt(r_dx*r_dx+r_dy*r_dy);
  var s_mag = Math.sqrt(s_dx*s_dx+s_dy*s_dy);
  if(r_dx/r_mag==s_dx/s_mag && r_dy/r_mag==s_dy/s_mag){
    // Unit vectors are the same.
    return null;
  }

  // SOLVE FOR T1 & T2
  var T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx);
  var T1 = (s_px+s_dx*T2-r_px)/r_dx;

  // Must be within parametic whatevers for RAY/SEGMENT
  if(T1<0) return null;
  if(T2<0 || T2>1) return null;

  // Return the POINT OF INTERSECTION
  return {
    x: r_px+r_dx*T1,
    y: r_py+r_dy*T1,
    param: T1
  };
};