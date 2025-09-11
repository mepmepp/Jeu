function Game(isEditor = false) {
  this.isEditor = isEditor; // 
  this.mouseX = this.mouseY = 0;
  this.gridX = this.gridY = -1;
  this.gridWall = true;

  this.jumpDown = false;
  this.leftDown = false;
  this.rightDown = false;
  this.jsonPlayerSpawn = { x: this.PLAYER_SPAWN_X, y: this.PLAYER_SPAWN_Y };
  
  this.COLUMNS = 40;
  this.ROWS = 20;
  this.coyoteTime = 0;      
  this.COYOTE_TIME_MAX = 0.3; 

  this.backgroundImage = new Image();
  this.backgroundImage.src = "../sprites/images/cave.jpg";

  this.levelCompleted = false;

  
  this.getCanvas();

  this.PLAYER_SIZE = Math.round(Game.prototype.PLAYER_SIZE * (this.GRID_RESOLUTION / 32));
this.PLAYER_JUMP_SPEED = Game.prototype.PLAYER_JUMP_SPEED * (this.GRID_RESOLUTION / 32);
this.PLAYER_WALK_SPEED = Game.prototype.PLAYER_WALK_SPEED * (this.GRID_RESOLUTION / 32);
this.PLAYER_WALK_ACCELERATION = Game.prototype.PLAYER_WALK_ACCELERATION * (this.GRID_RESOLUTION / 32);

  this.grid = new PlatformerGrid(this.COLUMNS, this.ROWS, this.GRID_RESOLUTION);

  this.grid.game = this; 

  for (var x = 0; x < this.grid.width; ++x)
    this.grid.setCeiling(x, this.grid.height - 1, true);

  this.jsonPlayerSpawn = { x: this.PLAYER_SPAWN_X, y: this.PLAYER_SPAWN_Y };

  this.player = new PlatformerNode(
    this.jsonPlayerSpawn.x,
    this.jsonPlayerSpawn.y,
    this.PLAYER_SIZE,
    this.PLAYER_SIZE
  );
  this.grid.addNode(this.player);

  this.addListeners();

  // 👇 Charger le niveau par défaut si on est en mode jeu
  if (!this.isEditor) {
    fetch("json/level1.json")
      .then(res => res.json())
      .then(layout => {
        const editor = new LevelEditor(this);
        editor.loadLayout(JSON.stringify(layout));
      })
      .catch(err => console.error("❌ Erreur chargement niveau :", err));
  }
}

Game.prototype = {
  GRID_RESOLUTION: 32,
  PLAYER_SIZE: 24,
  PAINT_STROKE_STYLE: "lime",
  ERASE_STROKE_STYLE: "red",
  PLAYER_JUMP_SPEED: -650,
  PLAYER_WALK_SPEED: 270,
  PLAYER_WALK_ACCELERATION: 3500,
  PLAYER_SPAWN_X: 100,
  PLAYER_SPAWN_Y: 100,
  controls: {
    jump: "KeyW",
    left: "KeyA",
    right: "KeyD"
  },

  addListeners() {
    // 👉 Seulement si on est en mode éditeur
    if (this.isEditor) {
      this.getCanvas().addEventListener("click", this.mouseClick.bind(this));
      this.getCanvas().addEventListener("mousemove", this.mouseMove.bind(this));
      this.getCanvas().addEventListener("mouseout", this.mouseLeave.bind(this));
    }

     window.addEventListener("keydown", this.keyDown.bind(this));
  window.addEventListener("keyup", this.keyUp.bind(this));
  window.addEventListener("resize", this.onResize.bind(this));
  },

  getCanvas() {
  const canvas = document.getElementById("renderer");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Garder toujours COLUMNS × ROWS
  this.GRID_RESOLUTION = Math.floor(Math.min(canvas.width / this.COLUMNS, canvas.height / this.ROWS));

  return canvas;
}
,
onResize() {
  // recalcule GRID_RESOLUTION et met à jour canvas et grille
  const canvas = this.getCanvas();

  // Met à jour la résolution de la grille existante (si elle existe)
  if (this.grid) {
    this.grid.resolution = this.GRID_RESOLUTION;
  }

  // Met à jour la taille du joueur (si on souhaite que le joueur suive la nouvelle résolution)
  // On conserve la position au même indice de case : convertit en coords de grille -> pixels
  if (this.player) {
    // calcule le centre du joueur en cases (coordGrille)
    const centerGridX = (this.player.x + this.player.width / 2) / this.GRID_RESOLUTION;
    const centerGridY = (this.player.y + this.player.height / 2) / this.GRID_RESOLUTION;

    // rescale PLAYER_SIZE
    this.PLAYER_SIZE = Math.round(Game.prototype.PLAYER_SIZE * (this.GRID_RESOLUTION / 32));

    // repositionne le joueur centré sur la même case
    this.player.width = this.player.height = this.PLAYER_SIZE;
    this.player.x = Math.floor(centerGridX) * this.GRID_RESOLUTION + (this.GRID_RESOLUTION - this.PLAYER_SIZE) / 2;
    this.player.y = Math.floor(centerGridY) * this.GRID_RESOLUTION + (this.GRID_RESOLUTION - this.PLAYER_SIZE) / 2;
  }

  // si tu stockes spawn en coordonnées de grille, tu pourrais recalculer jsonPlayerSpawn ici.
},



  run() {
    this.lastTime = performance.now();
    window.requestAnimationFrame(this.animate.bind(this));
  },

  keyDown(e) {
    switch (e.code) {
      case this.controls.jump:
        if (!this.jumpDown && (this.player.onGround || this.coyoteTime > 0)) {
          this.jumpDown = true;
          this.player.setvy(this.PLAYER_JUMP_SPEED);
          this.coyoteTime = 0;
        }
        break;
      case this.controls.right:
        this.rightDown = true;
        break;
      case this.controls.left:
        this.leftDown = true;
        break;
      case "Space":
        this.toggleDimension();
        break;
      case "KeyG": 
        if (this.isEditor && this.gridX != -1 && this.gridY != -1) {
          const cell = this.grid.getCell(this.gridX, this.gridY);
          if (cell.goal) {
            this.grid.setGoal(this.gridX, this.gridY, false); 
          } else {
            this.grid.setGoal(this.gridX, this.gridY, true); 
          }
        }
        break;
    }
  },

  keyUp(e) {
    switch (e.code) {
      case this.controls.jump:
        this.jumpDown = false;
        break;
      case this.controls.right:
        this.rightDown = false;
        break;
      case this.controls.left:
        this.leftDown = false;
        break;
    }
  },

  mouseClick(e) {
    if (!this.isEditor) return; // 👈 désactivé en mode jeu
    if (this.gridX == -1 || this.gridY == -1) return;

    if (this.gridWall)
      this.grid.setWall(this.gridX, this.gridY, !this.grid.getWall(this.gridX, this.gridY));
    else
      this.grid.setCeiling(this.gridX, this.gridY, !this.grid.getCeiling(this.gridX, this.gridY));
  },

  mouseMove(e) {
    if (!this.isEditor) return; // 👈 désactivé en mode jeu
    const bounds = this.getCanvas().getBoundingClientRect();

    this.mouseX = e.clientX - bounds.left;
    this.mouseY = e.clientY - bounds.top;
    this.gridX = Math.floor(this.mouseX / this.GRID_RESOLUTION);
    this.gridY = Math.floor(this.mouseY / this.GRID_RESOLUTION);

    this.findSelectedEdge();
  },

  findSelectedEdge() {
    const deltaX = this.mouseX - this.gridX * this.GRID_RESOLUTION;
    const deltaY = this.mouseY - this.gridY * this.GRID_RESOLUTION;
    this.gridWall = deltaX * deltaX < deltaY * deltaY;

    if (deltaX + deltaY > this.GRID_RESOLUTION) {
      if (deltaX > deltaY) {
        this.gridX = Math.min(this.gridX + 1, this.grid.width);
      } else {
        this.gridY = Math.min(this.gridY + 1, this.grid.height);
      }
      this.gridWall = !this.gridWall;
    }
  },

  mouseLeave(e) {
    this.gridX = this.gridY = -1;
  },

  animate() {
    const now = performance.now();
    let timeStep = (now - this.lastTime) / 1000; 
    if (timeStep > 0.1) timeStep = 0.1; 
    this.lastTime = now;

    this.movePlayer(timeStep);
    this.grid.update(timeStep);
    this.render(timeStep);

    window.requestAnimationFrame(this.animate.bind(this));
  },

  movePlayer(timeStep) {
    if (this.rightDown) {
      this.player.setvx(Math.min(this.player.vx + this.PLAYER_WALK_ACCELERATION * timeStep, this.PLAYER_WALK_SPEED));
    }

    if (this.leftDown) {
      this.player.setvx(Math.max(this.player.vx - this.PLAYER_WALK_ACCELERATION * timeStep, -this.PLAYER_WALK_SPEED));
    }

    if (
      this.player.x < -this.player.width ||
      this.player.y < -this.player.height ||
      this.player.x > this.getCanvas().width ||
      this.player.y > this.getCanvas().height
    ) {
      if (this.jsonPlayerSpawn) {
        this.player.x = this.jsonPlayerSpawn.x;
        this.player.y = this.jsonPlayerSpawn.y;
      } else {
        this.player.x = this.PLAYER_SPAWN_X;
        this.player.y = this.PLAYER_SPAWN_Y;
      }
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.onGround = false;
    }

    if (!this.leftDown && !this.rightDown) {
      const friction = 1000 * (this.GRID_RESOLUTION / 32) * timeStep;
      if (this.player.vx > 0) {
        this.player.vx = Math.max(0, this.player.vx - friction);
      } else if (this.player.vx < 0) {
        this.player.vx = Math.min(0, this.player.vx + friction);
      }
    }
    
    if (this.coyoteTime > 0) {
      this.coyoteTime -= timeStep;
    }

    if (this.player.onGround) {
      this.coyoteTime = this.COYOTE_TIME_MAX;
    }
  },

  render(timeStep) {
    var canvas = this.getCanvas();
    var context = canvas.getContext("2d");

    // context.clearRect(0, 0, canvas.width, canvas.height);
    // context.fillStyle = "white";
    // context.beginPath();
    // context.rect(0, 0, canvas.width, canvas.height);
    // context.fill();
    context.clearRect(0, 0, canvas.width, canvas.height);

if (this.backgroundImage.complete) {
  const img = this.backgroundImage;
  const canvasRatio = canvas.width / canvas.height;
  const imgRatio = img.width / img.height;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (canvasRatio > imgRatio) {
    // Le canvas est plus large → on ajuste sur la largeur
    drawWidth = canvas.width;
    drawHeight = canvas.width / imgRatio;
    offsetX = 0;
    offsetY = (canvas.height - drawHeight) / 2;
  } else {
    // Le canvas est plus haut → on ajuste sur la hauteur
    drawHeight = canvas.height;
    drawWidth = canvas.height * imgRatio;
    offsetX = (canvas.width - drawWidth) / 2;
    offsetY = 0;
  }

  context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
} else {
  // Fallback si l’image n’est pas encore chargée
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

    this.grid.draw(context, this.isEditor);

    if (this.isEditor && this.gridX != -1 && this.gridY != -1) {
      context.beginPath();
      context.lineWidth = PlatformerGrid.prototype.EDGE_LINE_WIDTH;

      if (this.gridWall) {
        if (this.grid.getWall(this.gridX, this.gridY))
          context.strokeStyle = this.ERASE_STROKE_STYLE;
        else
          context.strokeStyle = this.PAINT_STROKE_STYLE;

        context.moveTo(this.gridX * this.GRID_RESOLUTION, this.gridY * this.GRID_RESOLUTION);
        context.lineTo(this.gridX * this.GRID_RESOLUTION, (this.gridY + 1) * this.GRID_RESOLUTION);
      } else {
        if (this.grid.getCeiling(this.gridX, this.gridY))
          context.strokeStyle = this.ERASE_STROKE_STYLE;
        else
          context.strokeStyle = this.PAINT_STROKE_STYLE;

        context.moveTo(this.gridX * this.GRID_RESOLUTION, this.gridY * this.GRID_RESOLUTION);
        context.lineTo((this.gridX + 1) * this.GRID_RESOLUTION, this.gridY * this.GRID_RESOLUTION);
      }

      context.stroke();
    }
  },

  setControl(action, newKeyCode) {
    if (this.controls[action] !== undefined) {
      this.controls[action] = newKeyCode;
    }
  }
};

Game.prototype.toggleDimension = function () {
  this.grid.dimension = 1 - this.grid.dimension; 
  this.player.onGround = false;  
  this.grid.update(0);            
};

Game.prototype.loadNextLevel = function () {
  this.currentLevel = (this.currentLevel || 1) + 1;
  const nextLevelPath = `json/level${this.currentLevel}.json`;

  fetch(nextLevelPath)
    .then(res => {
      if (!res.ok) throw new Error("Niveau suivant introuvable");
      return res.json();
    })
    .then(layout => {
      const editor = new LevelEditor(this);
      editor.loadLayout(JSON.stringify(layout));
      console.log(`✅ Niveau ${this.currentLevel} chargé !`);
       this.levelCompleted = false; 
    })
    .catch(err => {
      alert("🎉 Bravo, tu as fini tous les niveaux !");
    });
};