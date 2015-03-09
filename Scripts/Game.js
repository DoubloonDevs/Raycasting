var canvas = document.getElementById("myCanvas"),
    c = canvas.getContext("2d"),
    camera = new Camera(c);

var map_length = 1600*2;

var width,
    height,
    mouseX,
    mouseY,
    touchX,
    touchY,
    joystick,
    debug = false,
    frameCount;

var background,
    spike,
    spr_player;

var world,
    player,
    water,
    block;

var bullets = [],
    lights = [],
    checkpoints = [],
    spawn_points = [],
    springs = [],
    blocks = [];

var upPressed = false,
    leftPressed = false,
    downPressed = false,
    rightPressed = false,
    game_over = false;

var left,
    right;

function setup() {
  // CANVAS PROPERTIES
  canvas.width = 1600;
  canvas.height = 900;
  width = canvas.width;
  height = canvas.height;
  camera.zoomTo(1600);

  // DEFINE OBJECTS & IMAGES
  
  world = new World(0.6, 0.875, false);
  water = new Water();
  left = new Button(2, height - 52, 50, 50, "button_left");

  //light = new Light(20, 20, 255, 116, 0, 1);
  //light = new Light(20, 20, 200, 51, 51, 1);
  //light = new Light(20, 20, 65, 59, 214, 1);

  background = new Image();
  background.src="Images/background.png";

  spike = new Image();
  spike.src="Images/spike.png";
  checkpoint = new Image();
  checkpoint.src="Images/checkpoint.png";

  lightbulb = new Image();
  lightbulb.src="Images/lightbulb.png";
  
  // CREATE WORLD
  for (var i = 0; i < map.length; i++) {
    for (var j = 0; j < map[i].length; j++) {
      if (map[i][j] == 1) {blocks.push(new Object(j * 32, i * 32, 32, 32, "block_dynamic", 'rgb('+(lights[0].r+57)+', '+(lights[0].g+57)+', '+(lights[0].b+57)+')'));}
      if (map[i][j] == 2) {blocks.push(new Object(j * 32, i * 32, 32, 32, "block_static", "#000"));}
      if (map[i][j] == 3) {blocks.push(new Object(j * 32, i * 32, 32, 32, "block_spike", "#000"));}
      if (map[i][j] == 4) {checkpoints.push(new Object(j * 32, i * 32 + 24, 32, 8, "block_checkpoint", "#fff"))}
      if (map[i][j] == 5) {lights.push(new Light(j * 32, i * 32, 112, 196, 224, 0.35));}
      if (map[i][j] == 6) {player = new Object(j * 32, i * 32, 32, 32, "player", "#fff");}
      if (map[i][j] == 7) {springs.push(new Spring(j * 32, i * 32));}
    }
  }
  player.speed = 8;
}
setup();

function draw() {
  camera.begin();
  // UPDATE
  update();
  c.imageSmoothingEnabled = false;
  c.mozImageSmoothingEnabled = false;
  
  // WORLD
  world.display();
  player.display();
  water.run();

  //BUTTONS
  left.display();
  left.update();
  camera.end();
}
setInterval(draw, 15);

function update() {
  // WORLD
  world.update();
  player.update();

  // LOGIC
  mouseX = canvas.mouseX;
  mouseY = canvas.mouseY;
  frameCount++;

  // CAMERA
  if (player.x > width/2) {
    camera.moveTo(Math.floor(player.x), height/2);
  } else {
    camera.moveTo(width/2, height/2);
  }
}

collisionBetween = function(shapeA, shapeB) {
  // get the vectors to check against
  var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
      vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
      // add the half widths and half heights of the objects
      hWidths = (shapeA.width / 2) + (shapeB.width / 2),
      hHeights = (shapeA.height / 2) + (shapeB.height / 2),
      colDir = null;

  if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
    // figures out on which side we are colliding (top, bottom, left, or right)
    var oX = hWidths - Math.abs(vX),
        oY = hHeights - Math.abs(vY);
    if (oX >= oY) {
      if (vY > 0) {
        colDir = "t";
        shapeA.y += oY;
        shapeA.vely = 0;
      } else {
        colDir = "b";
        shapeA.y -= oY;
        shapeA.vely = 0;
        shapeB.vely = 0;
      }
    } else {
      if (vX > 0) {
        colDir = "l";
        shapeA.x += oX;
        shapeB.velx = 0;
      } else {
        colDir = "r";
        shapeA.x -= oX;
        shapeB.velx = 0;
      }
    }
  }
  return colDir;
};

function World(grav, damp, scrolling) {
  this.x = 0;
  this.y = 0;
  this.velx = 0;
  this.vely = 0;
  this.gravity = grav;
  this.dampening = damp;
  this.scrolling = scrolling;
}
World.prototype.move = function(direction) {
  if (direction == "right") this.velx = -player.speed;
  if (direction == "left") this.velx = player.speed;
  if (direction == "up") this.vely = -player.speed;
  if (direction == "down") this.vely = player.speed;
};
World.prototype.update = function() {
  if (this.scrolling) {
    this.velx *= 0.8;
    this.x += this.velx;
    this.y += this.vely;
  }
};
World.prototype.display = function () {
  lights[0].drawShadows();
  //c.drawImage(background, 0, 0, width, height);
  for (var i = 0; i < lights.length; i++) {
    lights[i].run();
  }
  for (var i = 0; i < checkpoints.length; i++) {
    checkpoints[i].display();

    if (!player.alive) {
      player.x = spawn_points[spawn_points.length-1].x;
      player.y = spawn_points[spawn_points.length-1].y;
      player.velx = 0;
      player.vely = 0;
      player.alive = true;
    }

    if (collisionBetween(player, checkpoints[i]) === "b") {
      player.jumping = false;
      player.vely = 0;
      if (!this.active) {
        spawn_points.push(new Object(checkpoints[i].x, checkpoints[i].y, 32, 32, "null", "rgba(0, 0, 0, 0)"));
        checkpoints[i].active = true;
      }
    }
    if (collisionBetween(player, checkpoints[i]) === "t") {
      player.vely = 0;
      player.y++;
    }
  }
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].behaviour == "block_dynamic") blocks[i].update();
    blocks[i].display();
    // PLAYER
    if (blocks[i].behaviour == "block_spike") {
      if (collisionBetween(player, blocks[i]) === "b") {
        player.alive = false;
      }
    }
    if (collisionBetween(player, blocks[i]) === "b") {
      player.jumping = false;
      player.vely = 0;
    }
    if (i < blocks.length-1) {
      if (collisionBetween(blocks[i], blocks[i + 1]) === "b") {}
    }
    if (collisionBetween(player, blocks[i]) === "t") {
      player.vely = 0;
      player.y++;
    }
  }
};

function Object(x, y, width, height, behaviour, fill) {
  this.x = x;
  this.y = y;
  this.a = Math.atan2(mouseY - this.y, mouseX - this.x);
  this.velx = 0;
  this.vely = 0;
  this.speed = 17;
  this.terminalvel = 12;
  this.width = width;
  this.height = height;
  this.behaviour = behaviour;
  this.colour = fill;
  this.pinned = false;
  this.jumping = true;
  this.isColliding = false;
  this.alive = true;
  this.active = false;
}
Object.prototype.applyImpulse = function(xDirection, yDirection, force, jetpack) {
  this.xDirection = xDirection;
  this.yDirection = yDirection;
  this.force = force;
  this.jetpack = jetpack;
  this.angle = Math.atan2(this.yDirection, this.xDirection);
  if (!this.jetpack) {
    this.velx += Math.cos(this.angle) * this.force;
    this.vely = Math.sin(this.angle) * this.force;
  }
  else if (this.jetpack) {
    if (this.velx > -this.force) {
      this.velx += Math.cos(this.angle) * this.force/5;
    }
    if (this.vely > -this.force) {
      this.vely += Math.sin(this.angle) * this.force/5;
    }
  }
  this.jumping = true;
};
Object.prototype.isDead = function() {
  if (this.isColliding || this.x < 0 || this.y < 0 || this.x > width || this.y > height) {
    return true;
  } else {
    return false;
  }
};
Object.prototype.pin = function(parent, xoffset, yoffset) {
  this.x = parent.x + xoffset;
  this.y = parent.y + yoffset;
  this.velx = parent.velx;
  this.vely = parent.vely;
  this.pinned = true;
};
Object.prototype.applyForces = function() {
  this.velx *= world.dampening;
  if (!this.isColliding && this.vely < this.terminalvel) this.vely += world.gravity;
  this.x += this.velx + world.velx;
  this.y += this.vely + world.vely;
};
Object.prototype.control = function() {
  if (this.behaviour == "player") {
    if (leftPressed && this.velx > -this.speed) this.velx--;
    if (rightPressed && this.velx < this.speed) this.velx++;
    if (upPressed && !this.jumping) {
      this.y -= 1;
      this.applyImpulse(0, -1, 13, false);
      this.jumping = true;
    }
  }
  else {
    // Move towards player, top layer.
    if (this.x > player.x && player.y < height/2.5 && this.y < height/2.5 && this.velx > -this.speed) this.velx--;
    if (this.x < player.x && player.y < height/2.5 && this.y < height/2.5 && this.velx < this.speed) this.velx++;
    
    // Move towards player, bottom layer.
    if (this.x > player.x && player.y > height/2.5 && this.y > height/2.5 && this.velx > -this.speed) this.velx--;
    if (this.x < player.x && player.y > height/2.5 && this.y > height/2.5 && this.velx < this.speed) this.velx++;
    
    // If player is on top layer, find ya way up.
    //if (player.y < height/2 && this.y > height/2) {
    //  if (this.x > player.x && player.y < height/2 && this.y < height/2 && this.velx > -this.speed) this.velx--;
    //  if (this.x < player.x && player.y < height/2 && this.y < height/2 && this.velx < this.speed) this.velx++;
    //}

    // If player is on bottom layer && enemy is not, go right.
    if (player.y > height/2.5 && this.x < width && this.y < height/2.5 && this.velx < this.speed) this.velx++;

    // If player is on top layer && enemy is not, go right.
    if (player.y < height/2.5 && player.x < width/2 
      && this.x < width && this.y > height/2.5 && this.velx > -this.speed) this.velx -= 1;
    if (player.y < height/2.5 && player.x > width/2 
      && this.x < width && this.y > height/2.5 && this.velx < this.speed) this.velx++;
  }
};
Object.prototype.update = function() {
  var string = this.behaviour;
  var block = string.indexOf("block");
  if (block !== 0) {
    this.applyForces();
  } 
  if (this.behaviour == "block_dynamic") {
    this.colour = 'rgb('+(lights[0].r+47)+', '+(lights[0].g+47)+', '+(lights[0].b+47)+')';
  }
  if (this.behaviour == "player") {
    this.control();
    if (this.y > height) {
      this.alive = false;
    }
  }
  if (this.behaviour == "enemy") {
    this.control();
  }
  if (this.active == true) {
    spawn_points.push(new Block(this.x, this.y, 32, 32, "null", "rgba(0, 0, 0, 0)"));
  }
};
Object.prototype.display = function() {
  var string = this.behaviour;
  var block_sp = string.indexOf("spike");
  var block_ch = string.indexOf("checkpoint");
  c.save();
  c.fillStyle = this.colour;
  c.translate(Math.floor(this.x), Math.floor(this.y));
  c.rotate(this.a);
  if (block_sp < 0 && block_ch < 0) {
    c.fillRect(0, 0, this.width, this.height);
    //c.fillStyle = "rgba(0, 0, 0, 0.05)";
    //c.fillRect(0, 0, this.width, this.height / 2);
  } 
  if (block_sp !== -1 && block_ch < 0) {
    c.drawImage(spike, 0, 0, this.width, this.height);
  }
  if (block_ch !== -1 && block_sp < 0) {
    if (!this.active) c.fillStyle = 'rgba(0, 0, 0, 0.15)';
    else c.fillStyle = 'rgba(0, 0, 0, 0.45)';
    c.fillRect(-5, -37, this.width + 10, 37);
    c.fillStyle = this.colour;
    c.fillRect(-5, 0, this.width + 10, this.height);
  }
  c.restore();
};

function Button(x, y, w, h, behaviour) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h - h;
  this.behaviour = behaviour;
  this.pressed = false;
}
Button.prototype.pressed = function() {
  if (this.mouseX < this.x) return false;
  if (this.mouseY < this.y) return false;
  if (this.mouseX + this.width > this.x) return false;
  if (this.mouseY + this.height > this.y) return false;
  else return true;
};
Button.prototype.update = function() {
  if (this.behaviour == "button_left") {
    if (this.pressed) {
      leftPressed = true;
    } else {
      //leftPressed = false;
    }
  }
  if (this.behaviour == "button_right") {
    if (this.pressed) {
      rightPressed = true;
    } else {
      rightPressed = false;
    }
  }
};
Button.prototype.display = function() {
  c.fillStyle = 'rgb(255, 255, 255)';
  c.save();
  c.translate(this.x, this.y);
  c.fillRect(0, 0, this.width, this.height);
  c.restore();
};