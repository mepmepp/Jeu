// --- Types & Interfaces ---
interface Cell {
  wall: [boolean, boolean];
  ceiling: [boolean, boolean];
  goal?: boolean;
}

class PlatformerGridCell implements Cell {
  wall: [boolean, boolean] = [false, false];
  ceiling: [boolean, boolean] = [false, false];
  goal?: boolean = false;
}

class PlatformerNode {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  width: number;
  height: number;
  onGround = false;

  // positions précédentes pour collisions
  xp!: number;
  yp!: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x; this.y = y;
    this.width = width; this.height = height;
  }

  setvx(vx: number): void { this.vx = vx; }
  setvy(vy: number): void {
    this.vy = vy;
    if (vy !== 0) this.onGround = false;
  }

  getXCells(resolution: number) {
    return {
      start: Math.floor((this.x + PlatformerGrid.prototype.EPSILON) / resolution),
      end: Math.floor((this.x + this.width - PlatformerGrid.prototype.EPSILON) / resolution)
    };
  }

  getYCells(resolution: number) {
    return {
      start: Math.floor((this.y + PlatformerGrid.prototype.EPSILON) / resolution),
      end: Math.floor((this.y + this.height - PlatformerGrid.prototype.EPSILON) / resolution)
    };
  }

  getCellBottom(y: number, resolution: number) {
    return Math.floor((y + this.height - PlatformerGrid.prototype.EPSILON) / resolution);
  }
  getCellTop(y: number, resolution: number) {
    return Math.floor((y + PlatformerGrid.prototype.EPSILON) / resolution);
  }
  getCellRight(x: number, resolution: number) {
    return Math.floor((x + this.width - PlatformerGrid.prototype.EPSILON) / resolution);
  }
  getCellLeft(x: number, resolution: number) {
    return Math.floor((x + PlatformerGrid.prototype.EPSILON) / resolution);
  }

  collideCellBottom(resolution: number) {
    this.onGround = true;
    this.vy = 0;
    this.y = this.getCellBottom(this.y, resolution) * resolution - this.height;
  }
  collideCellTop(resolution: number) {
    this.vy = 0;
    this.y = this.getCellTop(this.yp, resolution) * resolution;
  }
  collideCellRight(resolution: number) {
    this.vx = 0;
    this.x = this.getCellRight(this.x, resolution) * resolution - this.width;
  }
  collideCellLeft(resolution: number) {
    this.vx = 0;
    this.x = this.getCellLeft(this.xp, resolution) * resolution;
  }

  limitXSpeed(timeStep: number) {
    if (this.vx * timeStep < -this.width + PlatformerGrid.prototype.EPSILON)
      this.vx = (-this.width + PlatformerGrid.prototype.EPSILON) / timeStep;
    if (this.vx * timeStep > this.width - PlatformerGrid.prototype.EPSILON)
      this.vx = (this.width - PlatformerGrid.prototype.EPSILON) / timeStep;
  }
  limitYSpeed(timeStep: number) {
    if (this.vy * timeStep < -this.height + PlatformerGrid.prototype.EPSILON)
      this.vy = (-this.height + PlatformerGrid.prototype.EPSILON) / timeStep;
    if (this.vy * timeStep > this.height - PlatformerGrid.prototype.EPSILON)
      this.vy = (this.height - PlatformerGrid.prototype.EPSILON) / timeStep;
  }
}

type XY = { x: number; y: number };

class PlatformerGrid {
  width: number;
  height: number;
  resolution: number;
  gravity: number;
  friction: number;

  nodes: PlatformerNode[] = [];
  dimension = 0;
  cells: PlatformerGridCell[] = [];
  spritePlayer: HTMLImageElement | null = null;
  spritePlayerCols = 6;
  spritePlayerRows = 1;
  currentFrame = 0;

  game?: any; // référencé par Game au runtime

  // styles
  EDGE_STROKE_STYLE = "white";
  EDGE_LINE_WIDTH = 4;
  GRID_STROKE_STYLE = "white";
  GRID_LINE_WIDTH = 0.5;
  PLAYER_FILL_STYLE = "red";
  EPSILON = 0.0000001;

  constructor(width: number, height: number, resolution: number, gravity = 2500, friction = 800) {
    this.width = width + 1;
    this.height = height + 1;
    this.resolution = resolution;
    this.gravity = gravity * (this.resolution / 32);
    this.friction = friction * (this.resolution / 32);

    for (let i = 0; i < this.width * this.height; ++i) {
      this.cells.push(new PlatformerGridCell());
    }
  }

  validateCoordinates(x: number, y: number): boolean {
    return !(x < 0 || y < 0 || x >= this.width || y >= this.height);
  }
  getCell(x: number, y: number): PlatformerGridCell {
    return this.cells[x + y * this.width];
  }
  getWall(x: number, y: number): boolean {
    if (!this.validateCoordinates(x, y)) return false;
    return this.getCell(x, y).wall[this.dimension];
  }
  getCeiling(x: number, y: number): boolean {
    if (!this.validateCoordinates(x, y)) return false;
    return this.getCell(x, y).ceiling[this.dimension];
  }
  setWall(x: number, y: number, value: boolean): void {
    if (this.validateCoordinates(x, y)) this.getCell(x, y).wall[this.dimension] = value;
  }
  setCeiling(x: number, y: number, value: boolean): void {
    if (this.validateCoordinates(x, y)) this.getCell(x, y).ceiling[this.dimension] = value;
  }
  getGoal(x: number, y: number): boolean {
    if (!this.validateCoordinates(x, y)) return false;
    return !!this.getCell(x, y).goal;
  }
  setGoal(x: number, y: number, value: boolean): void {
    if (this.validateCoordinates(x, y)) this.getCell(x, y).goal = value;
  }

  addNode(node: PlatformerNode): void { this.nodes.push(node); }
  removeNode(node: PlatformerNode): void {
    const i = this.nodes.indexOf(node);
    if (i !== -1) this.nodes.splice(i, 1);
  }

  update(timeStep: number): void {
    const player = this.nodes[0];
    if (player) {
      const goalX = Math.floor((player.x + player.width / 2) / this.resolution);
      const goalY = Math.floor((player.y + player.height / 2) / this.resolution);

      if (this.getGoal(goalX, goalY)) {
        if (this.game && !this.game.levelCompleted) {
          this.game.levelCompleted = true;
          this.dimension = 0;
          this.game.loadNextLevel?.(); // optional chaining côté TS
        }
        return;
      }
    }

    for (let i = 0; i < this.nodes.length; ++i) {
      const node = this.nodes[i];

      // X
      if (node.vx !== 0) {
        node.limitXSpeed(timeStep);
        const vx = node.vx * timeStep;
        node.xp = node.x;
        node.x += vx;

        if (node.vx > 0) {
          if (node.getCellRight(node.x, this.resolution) !== node.getCellRight(node.xp, this.resolution)) {
            const yCells = node.getYCells(this.resolution);
            for (let y = yCells.start; y <= yCells.end; ++y) {
              if (this.getWall(node.getCellRight(node.x, this.resolution), y) ||
                  (y !== yCells.start && this.getCeiling(node.getCellRight(node.x, this.resolution), y))) {
                node.collideCellRight(this.resolution); break;
              }
            }
          }
        } else {
          if (node.getCellLeft(node.x, this.resolution) !== node.getCellLeft(node.xp, this.resolution)) {
            const yCells = node.getYCells(this.resolution);
            for (let y = yCells.start; y <= yCells.end; ++y) {
              if (this.getWall(node.getCellLeft(node.xp, this.resolution), y) ||
                  (y !== yCells.start && this.getCeiling(node.getCellLeft(node.x, this.resolution), y))) {
                node.collideCellLeft(this.resolution); break;
              }
            }
          }
        }

        // sol sous les pieds ?
        if (node.onGround) {
          const xCells = node.getXCells(this.resolution);
          for (let x = xCells.start; x <= xCells.end; ++x) {
            node.onGround = false;
            if (this.getCeiling(x, node.getCellBottom(node.y, this.resolution) + 1) ||
                (x !== xCells.start && this.getWall(x, node.getCellBottom(node.y, this.resolution) + 1))) {
              node.onGround = true; break;
            }
          }
        }

        // friction
        if (node.onGround) {
          if (node.vx > 0) { node.vx -= this.friction * timeStep; if (node.vx < 0) node.vx = 0; }
          else if (node.vx < 0) { node.vx += this.friction * timeStep; if (node.vx > 0) node.vx = 0; }
        }
      }

      // Y (gravité)
      if (!node.onGround) node.vy += this.gravity * timeStep;

      if (node.vy !== 0) {
        node.limitYSpeed(timeStep);
        const vy = node.vy * timeStep;
        node.yp = node.y;
        node.y += vy;

        if (node.vy > 0) {
          if (node.getCellBottom(node.y, this.resolution) !== node.getCellBottom(node.yp, this.resolution)) {
            const xCells = node.getXCells(this.resolution);
            for (let x = xCells.start; x <= xCells.end; ++x) {
              if (this.getCeiling(x, node.getCellBottom(node.y, this.resolution)) ||
                  (x !== xCells.start && this.getWall(x, node.getCellBottom(node.y, this.resolution)))) {
                node.collideCellBottom(this.resolution); break;
              }
            }
          }
        } else {
          if (node.getCellTop(node.y, this.resolution) !== node.getCellTop(node.yp, this.resolution)) {
            const xCells = node.getXCells(this.resolution);
            for (let x = xCells.start; x <= xCells.end; ++x) {
              if (this.getCeiling(x, node.getCellTop(node.yp, this.resolution)) ||
                  (x !== xCells.start && this.getWall(x, node.getCellTop(node.y, this.resolution)))) {
                node.collideCellTop(this.resolution); break;
              }
            }
          }
        }
      }
    }
  }

  drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = this.GRID_STROKE_STYLE;
    ctx.lineWidth = this.GRID_LINE_WIDTH;

    for (let y = 0; y < this.height; ++y) {
      ctx.beginPath();
      ctx.moveTo(0, y * this.resolution);
      ctx.lineTo(this.width * this.resolution, y * this.resolution);
      ctx.stroke();
    }
    for (let x = 0; x < this.width; ++x) {
      ctx.beginPath();
      ctx.moveTo(x * this.resolution, 0);
      ctx.lineTo(x * this.resolution, this.height * this.resolution);
      ctx.stroke();
    }
  }

  drawWalls(ctx: CanvasRenderingContext2D): void {
    for (let x = 0; x < this.width; ++x) {
      for (let y = 0; y < this.height; ++y) {
        const cell = this.getCell(x, y);

        if (cell.wall[this.dimension]) {
          ctx.strokeStyle = this.EDGE_STROKE_STYLE; ctx.globalAlpha = 1; ctx.lineWidth = this.EDGE_LINE_WIDTH;
          ctx.beginPath(); ctx.moveTo(x * this.resolution, (y + 1) * this.resolution);
          ctx.lineTo(x * this.resolution, y * this.resolution); ctx.stroke();
        }
        if (cell.ceiling[this.dimension]) {
          ctx.strokeStyle = this.EDGE_STROKE_STYLE; ctx.globalAlpha = 1; ctx.lineWidth = this.EDGE_LINE_WIDTH;
          ctx.beginPath(); ctx.moveTo((x + 1) * this.resolution, y * this.resolution);
          ctx.lineTo(x * this.resolution, y * this.resolution); ctx.stroke();
        }

        if (cell.goal) {
          const margin = this.resolution * 0.05;
          const size = this.resolution - margin * 2;
          ctx.fillStyle = "gold"; ctx.globalAlpha = 0.8;
          ctx.fillRect(x * this.resolution + margin, y * this.resolution + margin, size, size);
          ctx.globalAlpha = 1;
        }

        // dimension inactive (bleu)
        const inactive = 1 - this.dimension;
        if (cell.wall[inactive]) {
          ctx.strokeStyle = "blue"; ctx.globalAlpha = 0.3; ctx.lineWidth = this.EDGE_LINE_WIDTH;
          ctx.beginPath(); ctx.moveTo(x * this.resolution, (y + 1) * this.resolution);
          ctx.lineTo(x * this.resolution, y * this.resolution); ctx.stroke();
        }
        if (cell.ceiling[inactive]) {
          ctx.strokeStyle = "blue"; ctx.globalAlpha = 0.3; ctx.lineWidth = this.EDGE_LINE_WIDTH;
          ctx.beginPath(); ctx.moveTo((x + 1) * this.resolution, y * this.resolution);
          ctx.lineTo(x * this.resolution, y * this.resolution); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }
  }

  drawNodes(ctx: CanvasRenderingContext2D): void {
    const scale = 1.5;
    for (const node of this.nodes) {
      const drawW = node.width * scale;
      const drawH = node.height * scale;
      const offsetX = node.x - (drawW - node.width) / 2;
      const offsetY = node.y + node.height - drawH;

      if (this.spritePlayer && this.spritePlayer.complete) {
        const frameW = this.spritePlayer.width / this.spritePlayerCols;
        const frameH = this.spritePlayer.height / this.spritePlayerRows;
        const sx = (this.currentFrame % this.spritePlayerCols) * frameW;
        const sy = Math.floor(this.currentFrame / this.spritePlayerCols) * frameH;

        ctx.save();
        if (node.vx < 0) {
          ctx.scale(-1, 1);
          ctx.drawImage(this.spritePlayer, sx, sy, frameW, frameH, -(offsetX + drawW), offsetY, drawW, drawH);
        } else {
          ctx.drawImage(this.spritePlayer, sx, sy, frameW, frameH, offsetX, offsetY, drawW, drawH);
        }
        ctx.restore();
      } else {
        ctx.fillStyle = this.PLAYER_FILL_STYLE;
        ctx.fillRect(node.x, node.y, node.width, node.height);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, isEditor: boolean): void {
    if (isEditor) this.drawGrid(ctx);
    this.drawWalls(ctx);
    this.drawNodes(ctx);
  }
}
