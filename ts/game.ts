// game.ts
import { PlatformerGrid, PlatformerNode } from "./platformer";
import { LevelEditor } from "./editor";

export class Game {
  grid: PlatformerGrid;
  player: PlatformerNode;
  isEditor: boolean;

  jumpDown: boolean = false;
  leftDown: boolean = false;
  rightDown: boolean = false;

  coyoteTime: number = 0;
  COYOTE_TIME_MAX: number = 0.3;

  jsonPlayerSpawn: { x: number; y: number };
  levelCompleted: boolean = false;
  currentLevel: number = 1;

  backgroundImage: HTMLImageElement = new Image();

  GRID_RESOLUTION: number = 32;
  PLAYER_SIZE: number = 24;
  PLAYER_JUMP_SPEED: number = -650;
  PLAYER_WALK_SPEED: number = 270;
  PLAYER_WALK_ACCELERATION: number = 3500;

  controls: { [action: string]: string } = {
    jump: "KeyW",
    left: "KeyA",
    right: "KeyD",
  };

  lastTime: number = 0;

  // Coordonnées pour l'éditeur
  mouseX: number = 0;
  mouseY: number = 0;
  gridX: number = -1;
  gridY: number = -1;
  gridWall: boolean = true;

  constructor(isEditor: boolean = false) {
    this.isEditor = isEditor;

    this.backgroundImage.src = "../sprites/images/cave.jpg";

    // Création de la grille
    this.grid = new PlatformerGrid(40, 20, this.GRID_RESOLUTION);
    this.grid.game = this;

    // Création du joueur
    this.PLAYER_SIZE = Math.round(this.PLAYER_SIZE * (this.GRID_RESOLUTION / 32));
    this.PLAYER_JUMP_SPEED *= this.GRID_RESOLUTION / 32;
    this.PLAYER_WALK_SPEED *= this.GRID_RESOLUTION / 32;
    this.PLAYER_WALK_ACCELERATION *= this.GRID_RESOLUTION / 32;

    this.player = new PlatformerNode(100, 100, this.PLAYER_SIZE, this.PLAYER_SIZE);
    this.grid.addNode(this.player);

    this.jsonPlayerSpawn = { x: this.player.x, y: this.player.y };

    this.addListeners();

    if (!this.isEditor) this.loadLevel("json/level1.json");
  }

  getCanvas(): HTMLCanvasElement {
    const canvas = document.getElementById("renderer") as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.GRID_RESOLUTION = Math.floor(Math.min(canvas.width / 40, canvas.height / 20));
    return canvas;
  }

  onResize() {
    const canvas = this.getCanvas();
    if (this.grid) this.grid.resolution = this.GRID_RESOLUTION;

    if (this.player) {
      const centerGridX = (this.player.x + this.player.width / 2) / this.GRID_RESOLUTION;
      const centerGridY = (this.player.y + this.player.height / 2) / this.GRID_RESOLUTION;

      this.PLAYER_SIZE = Math.round(24 * (this.GRID_RESOLUTION / 32));
      this.player.width = this.player.height = this.PLAYER_SIZE;
      this.player.x = Math.floor(centerGridX) * this.GRID_RESOLUTION + (this.GRID_RESOLUTION - this.PLAYER_SIZE) / 2;
      this.player.y = Math.floor(centerGridY) * this.GRID_RESOLUTION + (this.GRID_RESOLUTION - this.PLAYER_SIZE) / 2;
    }
  }

  addListeners() {
    if (this.isEditor) {
      this.getCanvas().addEventListener("click", this.mouseClick.bind(this));
      this.getCanvas().addEventListener("mousemove", this.mouseMove.bind(this));
      this.getCanvas().addEventListener("mouseout", this.mouseLeave.bind(this));
    }

    window.addEventListener("keydown", this.keyDown.bind(this));
    window.addEventListener("keyup", this.keyUp.bind(this));
    window.addEventListener("resize", this.onResize.bind(this));
  }

  keyDown(e: KeyboardEvent) {
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
        if (this.isEditor && this.gridX !== -1 && this.gridY !== -1) {
          const cell = this.grid.getCell(this.gridX, this.gridY);
          cell.goal = !cell.goal;
        }
        break;
    }
  }

  keyUp(e: KeyboardEvent) {
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
  }

  mouseClick(e: MouseEvent) {
    if (!this.isEditor || this.gridX === -1 || this.gridY === -1) return;
    if (this.gridWall) this.grid.setWall(this.gridX, this.gridY, !this.grid.getWall(this.gridX, this.gridY));
    else this.grid.setCeiling(this.gridX, this.gridY, !this.grid.getCeiling(this.gridX, this.gridY));
  }

  mouseMove(e: MouseEvent) {
    if (!this.isEditor) return;
    const bounds = this.getCanvas().getBoundingClientRect();
    this.mouseX = e.clientX - bounds.left;
    this.mouseY = e.clientY - bounds.top;
    this.gridX = Math.floor(this.mouseX / this.GRID_RESOLUTION);
    this.gridY = Math.floor(this.mouseY / this.GRID_RESOLUTION);

    this.findSelectedEdge();
  }

  findSelectedEdge() {
    const deltaX = this.mouseX - this.gridX * this.GRID_RESOLUTION;
    const deltaY = this.mouseY - this.gridY * this.GRID_RESOLUTION;
    this.gridWall = deltaX * deltaX < deltaY * deltaY;

    if (deltaX + deltaY > this.GRID_RESOLUTION) {
      if (deltaX > deltaY) this.gridX = Math.min(this.gridX + 1, this.grid.width);
      else this.gridY = Math.min(this.gridY + 1, this.grid.height);
      this.gridWall = !this.gridWall;
    }
  }

  mouseLeave(e: MouseEvent) {
    this.gridX = this.gridY = -1;
  }

  run() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.animate.bind(this));
  }

  animate() {
    const now = performance.now();
    let timeStep = (now - this.lastTime) / 1000;
    if (timeStep > 0.1) timeStep = 0.1;
    this.lastTime = now;

    this.movePlayer(timeStep);
    this.grid.update(timeStep);
    this.render(timeStep);

    requestAnimationFrame(this.animate.bind(this));
  }

  movePlayer(timeStep: number) {
    if (this.rightDown) this.player.setvx(Math.min(this.player.vx + this.PLAYER_WALK_ACCELERATION * timeStep, this.PLAYER_WALK_SPEED));
    if (this.leftDown) this.player.setvx(Math.max(this.player.vx - this.PLAYER_WALK_ACCELERATION * timeStep, -this.PLAYER_WALK_SPEED));

    if (!this.leftDown && !this.rightDown) {
      const friction = 1000 * (this.GRID_RESOLUTION / 32) * timeStep;
      if (this.player.vx > 0) this.player.vx = Math.max(0, this.player.vx - friction);
      else if (this.player.vx < 0) this.player.vx = Math.min(0, this.player.vx + friction);
    }

    if (this.coyoteTime > 0) this.coyoteTime -= timeStep;
    if (this.player.onGround) this.coyoteTime = this.COYOTE_TIME_MAX;
  }

  render(timeStep: number) {
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
      ctx.lineWidth = this.grid.EDGE_LINE_WIDTH;

      if (this.gridWall) {
        ctx.strokeStyle = this.grid.getWall(this.gridX, this.gridY) ? "red" : "lime";
        ctx.moveTo(this.gridX * this.GRID_RESOLUTION, this.gridY * this.GRID_RESOLUTION);
        ctx.lineTo(this.gridX * this.GRID_RESOLUTION, (this.gridY + 1) * this.GRID_RESOLUTION);
      } else {
        ctx.strokeStyle = this.grid.getCeiling(this.gridX, this.gridY) ? "red" : "lime";
        ctx.moveTo(this.gridX * this.GRID_RESOLUTION, this.gridY * this.GRID_RESOLUTION);
        ctx.lineTo((this.gridX + 1) * this.GRID_RESOLUTION, this.gridY * this.GRID_RESOLUTION);
      }

      ctx.stroke();
    }
  }

  setControl(action: string, newKeyCode: string) {
    if (this.controls[action] !== undefined) this.controls[action] = newKeyCode;
  }

  toggleDimension() {
    this.grid.dimension = 1 - this.grid.dimension;
    this.player.onGround = false;
    this.grid.update(0);
  }

  loadNextLevel() {
    this.currentLevel++;
    const nextLevelPath = `json/level${this.currentLevel}.json`;
    fetch(nextLevelPath)
      .then(res => {
        if (!res.ok) throw new Error("Niveau suivant introuvable");
        return res.json();
      })
      .then(layout => {
        const editor = new LevelEditor(this);
        editor.loadLayout(JSON.stringify(layout));
        this.levelCompleted = false;
        console.log(`✅ Niveau ${this.currentLevel} chargé !`);
      })
      .catch(() => alert("🎉 Bravo, tu as fini tous les niveaux !"));
  }

  private loadLevel(path: string) {
    fetch(path)
      .then(res => res.json())
      .then(layout => {
        const editor = new LevelEditor(this);
        editor.loadLayout(JSON.stringify(layout));
      });
  }
}
