class Game {
  isEditor: boolean;
  mouseX = 0; mouseY = 0;
  gridX = -1; gridY = -1;
  gridWall = true;

  jumpDown = false;
  leftDown = false;
  rightDown = false;

  jsonPlayerSpawn: { x: number; y: number };

  COLUMNS = 40;
  ROWS = 20;
  coyoteTime = 0;
  COYOTE_TIME_MAX = 0.3;

  backgroundImage: HTMLImageElement;
  levelCompleted = false;

  lastTime = performance.now();
  lastFrameTime?: number;

  GRID_RESOLUTION = 32;
  PLAYER_SIZE = 24;
  PAINT_STROKE_STYLE = "lime";
  ERASE_STROKE_STYLE = "red";
  PLAYER_JUMP_SPEED = -650;
  PLAYER_WALK_SPEED = 270;
  PLAYER_WALK_ACCELERATION = 3500;
  PLAYER_SPAWN_X = 100;
  PLAYER_SPAWN_Y = 100;

  controls = { jump: "KeyW", left: "KeyA", right: "KeyD" };

  grid: PlatformerGrid;
  player: PlatformerNode;

  // closure compteur de sauts
  private jumpCounterFn: () => number;

  constructor(isEditor = false) {
    this.isEditor = isEditor;

    // closure
    const createCounter = () => {
      let count = 0;
      return () => ++count;
    };
    this.jumpCounterFn = createCounter();

    this.backgroundImage = new Image();
    this.backgroundImage.src = "../sprites/images/cave.jpg";

    this.getCanvas();

    // scale en fonction de la résolution dynamique
    this.PLAYER_SIZE = Math.round(Game.prototype.PLAYER_SIZE * (this.GRID_RESOLUTION / 32));
    this.PLAYER_JUMP_SPEED = Game.prototype.PLAYER_JUMP_SPEED * (this.GRID_RESOLUTION / 32);
    this.PLAYER_WALK_SPEED = Game.prototype.PLAYER_WALK_SPEED * (this.GRID_RESOLUTION / 32);
    this.PLAYER_WALK_ACCELERATION = Game.prototype.PLAYER_WALK_ACCELERATION * (this.GRID_RESOLUTION / 32);

    this.grid = new PlatformerGrid(this.COLUMNS, this.ROWS, this.GRID_RESOLUTION);
    (this.grid as any).game = this;

    for (let x = 0; x < this.grid.width; ++x)
      this.grid.setCeiling(x, this.grid.height - 1, true);

    this.jsonPlayerSpawn = { x: this.PLAYER_SPAWN_X, y: this.PLAYER_SPAWN_Y };
    this.player = new PlatformerNode(this.jsonPlayerSpawn.x, this.jsonPlayerSpawn.y, this.PLAYER_SIZE, this.PLAYER_SIZE);
    this.grid.addNode(this.player);

    this.addListeners();

    // Chargement du niveau par défaut si jeu
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

  addListeners(): void {
    if (this.isEditor) {
      this.getCanvas().addEventListener("click", this.mouseClick.bind(this));
      this.getCanvas().addEventListener("mousemove", this.mouseMove.bind(this));
      this.getCanvas().addEventListener("mouseout", this.mouseLeave.bind(this));
    }
    window.addEventListener("keydown", this.keyDown.bind(this));
    window.addEventListener("keyup", this.keyUp.bind(this));
    window.addEventListener("resize", this.onResize.bind(this));
  }

  getCanvas(): HTMLCanvasElement {
    const canvas = document.getElementById("renderer") as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.GRID_RESOLUTION = Math.floor(Math.min(canvas.width / this.COLUMNS, canvas.height / this.ROWS));
    return canvas;
  }

  onResize(): void {
    const canvas = this.getCanvas();
    if (this.grid) this.grid.resolution = this.GRID_RESOLUTION;

    if (this.player) {
      const centerGridX = (this.player.x + this.player.width / 2) / this.GRID_RESOLUTION;
      const centerGridY = (this.player.y + this.player.height / 2) / this.GRID_RESOLUTION;

      this.PLAYER_SIZE = Math.round(Game.prototype.PLAYER_SIZE * (this.GRID_RESOLUTION / 32));
      this.player.width = this.player.height = this.PLAYER_SIZE;
      this.player.x = Math.floor(centerGridX) * this.GRID_RESOLUTION + (this.GRID_RESOLUTION - this.PLAYER_SIZE) / 2;
      this.player.y = Math.floor(centerGridY) * this.GRID_RESOLUTION + (this.GRID_RESOLUTION - this.PLAYER_SIZE) / 2;
    }
  }

  run(): void {
    this.lastTime = performance.now();
    window.requestAnimationFrame(this.animate.bind(this));
  }

  keyDown(e: KeyboardEvent): void {
    switch (e.code) {
      case this.controls.jump:
        if (!this.jumpDown && (this.player.onGround || this.coyoteTime > 0)) {
          this.jumpDown = true;
          this.player.setvy(this.PLAYER_JUMP_SPEED);
          this.coyoteTime = 0;
          console.log(`Nombre de sauts : ${this.jumpCounterFn()}`);
        }
        break;
      case this.controls.right: this.rightDown = true; break;
      case this.controls.left: this.leftDown = true; break;
      case "Space": this.toggleDimension(); break;
      case "KeyG":
        if (this.isEditor && this.gridX !== -1 && this.gridY !== -1) {
          const cell = this.grid.getCell(this.gridX, this.gridY);
          this.grid.setGoal(this.gridX, this.gridY, !cell.goal);
        }
        break;
    }
  }

  keyUp(e: KeyboardEvent): void {
    switch (e.code) {
      case this.controls.jump: this.jumpDown = false; break;
      case this.controls.right: this.rightDown = false; break;
      case this.controls.left: this.leftDown = false; break;
    }
  }

  mouseClick(_e: MouseEvent): void {
    if (!this.isEditor) return;
    if (this.gridX === -1 || this.gridY === -1) return;

    if (this.gridWall)
      this.grid.setWall(this.gridX, this.gridY, !this.grid.getWall(this.gridX, this.gridY));
    else
      this.grid.setCeiling(this.gridX, this.gridY, !this.grid.getCeiling(this.gridX, this.gridY));
  }

  mouseMove(e: MouseEvent): void {
    if (!this.isEditor) return;
    const bounds = this.getCanvas().getBoundingClientRect();
    this.mouseX = e.clientX - bounds.left;
    this.mouseY = e.clientY - bounds.top;
    this.gridX = Math.floor(this.mouseX / this.GRID_RESOLUTION);
    this.gridY = Math.floor(this.mouseY / this.GRID_RESOLUTION);
    this.findSelectedEdge();
  }

  findSelectedEdge(): void {
    const deltaX = this.mouseX - this.gridX * this.GRID_RESOLUTION;
    const deltaY = this.mouseY - this.gridY * this.GRID_RESOLUTION;
    this.gridWall = deltaX * deltaX < deltaY * deltaY;

    if (deltaX + deltaY > this.GRID_RESOLUTION) {
      if (deltaX > deltaY) this.gridX = Math.min(this.gridX + 1, this.grid.width);
      else this.gridY = Math.min(this.gridY + 1, this.grid.height);
      this.gridWall = !this.gridWall;
    }
  }

  mouseLeave(_e: MouseEvent): void {
    this.gridX = this.gridY = -1;
  }

  animate(): void {
    const now = performance.now();
    let timeStep = (now - this.lastTime) / 1000;
    if (timeStep > 0.1) timeStep = 0.1;
    this.lastTime = now;

    this.movePlayer(timeStep);
    this.grid.update(timeStep);
    this.render(timeStep);

    if ((this.leftDown || this.rightDown) && (!this.lastFrameTime || now - this.lastFrameTime > 100)) {
      this.grid.currentFrame = (this.grid.currentFrame + 1) % this.grid.spritePlayerCols;
      this.lastFrameTime = now;
    } else if (!this.leftDown && !this.rightDown) {
      this.grid.currentFrame = 0;
    }

    requestAnimationFrame(this.animate.bind(this));
  }

  movePlayer(timeStep: number): void {
    const playerX = this.player.x;
    const playerY = this.player.y;
    document.documentElement.style.setProperty('--player-x', `${playerX}px`);
    document.documentElement.style.setProperty('--player-y', `${playerY}px`);
    console.log(`x: ${playerX}; y: ${playerY}`);

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
      this.player.vx = 0; this.player.vy = 0; this.player.onGround = false;
    }

    if (!this.leftDown && !this.rightDown) {
      const friction = 1000 * (this.GRID_RESOLUTION / 32) * timeStep;
      if (this.player.vx > 0) this.player.vx = Math.max(0, this.player.vx - friction);
      else if (this.player.vx < 0) this.player.vx = Math.min(0, this.player.vx + friction);
    }

    if (this.coyoteTime > 0) this.coyoteTime -= timeStep;
    if (this.player.onGround) this.coyoteTime = this.COYOTE_TIME_MAX;
  }

  render(_timeStep: number): void {
    const canvas = this.getCanvas();
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.backgroundImage.complete) {
      const img = this.backgroundImage;
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;

      let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;
      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    } else {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    this.grid.draw(ctx, this.isEditor);

    if (this.isEditor && this.gridX !== -1 && this.gridY !== -1) {
      ctx.beginPath();
      ctx.lineWidth = PlatformerGrid.prototype.EDGE_LINE_WIDTH;

      if (this.gridWall) {
        ctx.strokeStyle = this.grid.getWall(this.gridX, this.gridY) ? this.ERASE_STROKE_STYLE : this.PAINT_STROKE_STYLE;
        ctx.moveTo(this.gridX * this.GRID_RESOLUTION, this.gridY * this.GRID_RESOLUTION);
        ctx.lineTo(this.gridX * this.GRID_RESOLUTION, (this.gridY + 1) * this.GRID_RESOLUTION);
      } else {
        ctx.strokeStyle = this.grid.getCeiling(this.gridX, this.gridY) ? this.ERASE_STROKE_STYLE : this.PAINT_STROKE_STYLE;
        ctx.moveTo(this.gridX * this.GRID_RESOLUTION, this.gridY * this.GRID_RESOLUTION);
        ctx.lineTo((this.gridX + 1) * this.GRID_RESOLUTION, this.gridY * this.GRID_RESOLUTION);
      }
      ctx.stroke();
    }
  }

  setControl(action: keyof Game["controls"], newKeyCode: string): void {
    if ((this.controls as any)[action] !== undefined) {
      (this.controls as any)[action] = newKeyCode;
    }
  }

  toggleDimension(): void {
    this.grid.dimension = 1 - this.grid.dimension;
    this.player.onGround = false;
    this.grid.update(0);
  }

  loadNextLevel(): void {
    (this as any).currentLevel = ((this as any).currentLevel || 1) + 1;
    const nextLevelPath = `json/level${(this as any).currentLevel}.json`;

    fetch(nextLevelPath)
      .then(res => {
        if (!res.ok) throw new Error("Niveau suivant introuvable");
        return res.json();
      })
      .then(layout => {
        const editor = new LevelEditor(this);
        editor.loadLayout(JSON.stringify(layout));
        console.log(`✅ Niveau ${(this as any).currentLevel} chargé !`);
        this.levelCompleted = false;
      })
      .catch(_err => {
        alert("🎉 Bravo, tu as fini tous les niveaux !");
      });
  }
}
