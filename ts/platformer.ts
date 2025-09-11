// platformer.ts

export interface IGridCell {
  wall: boolean[];
  ceiling: boolean[];
  goal: boolean;
}

export interface INode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  onGround: boolean;

  setvx(vx: number): void;
  setvy(vy: number): void;
}

export class PlatformerGridCell implements IGridCell {
  wall: boolean[] = [false, false];
  ceiling: boolean[] = [false, false];
  goal: boolean = false;
}

export class PlatformerNode implements INode {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  width: number;
  height: number;
  onGround: boolean = false;

  xp: number = 0;
  yp: number = 0;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  setvx(vx: number) {
    this.vx = vx;
  }

  setvy(vy: number) {
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

export class PlatformerGrid {
  width: number;
  height: number;
  resolution: number;
  gravity: number;
  friction: number;
  nodes: PlatformerNode[] = [];
  cells: PlatformerGridCell[] = [];
  dimension: number = 0;
  game?: any;

  EDGE_STROKE_STYLE: string = "white";
  EDGE_LINE_WIDTH: number = 4;
  GRID_STROKE_STYLE: string = "white";
  GRID_LINE_WIDTH: number = 0.5;
  PLAYER_FILL_STYLE: string = "red";
  EPSILON: number = 1e-7;

  constructor(width: number, height: number, resolution: number, gravity: number = 2500, friction: number = 800) {
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
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  getCell(x: number, y: number): PlatformerGridCell {
    return this.cells[x + y * this.width];
  }

  getWall(x: number, y: number) {
    if (!this.validateCoordinates(x, y)) return false;
    return this.getCell(x, y).wall[this.dimension];
  }

  setWall(x: number, y: number, value: boolean) {
    if (this.validateCoordinates(x, y)) this.getCell(x, y).wall[this.dimension] = value;
  }

  getCeiling(x: number, y: number) {
    if (!this.validateCoordinates(x, y)) return false;
    return this.getCell(x, y).ceiling[this.dimension];
  }

  setCeiling(x: number, y: number, value: boolean) {
    if (this.validateCoordinates(x, y)) this.getCell(x, y).ceiling[this.dimension] = value;
  }

  getGoal(x: number, y: number) {
    if (!this.validateCoordinates(x, y)) return false;
    return this.getCell(x, y).goal;
  }

  setGoal(x: number, y: number, value: boolean) {
    if (this.validateCoordinates(x, y)) this.getCell(x, y).goal = value;
  }

  addNode(node: PlatformerNode) {
    this.nodes.push(node);
  }

  removeNode(node: PlatformerNode) {
    const index = this.nodes.indexOf(node);
    if (index !== -1) this.nodes.splice(index, 1);
  }

  update(timeStep: number) {
    const player = this.nodes[0];
    if (!player) return;

    const goalX = Math.floor((player.x + player.width / 2) / this.resolution);
    const goalY = Math.floor((player.y + player.height / 2) / this.resolution);

    if (this.getGoal(goalX, goalY)) {
      if (this.game && !this.game.levelCompleted) {
        this.game.levelCompleted = true;
        this.dimension = 0;
        this.game.loadNextLevel();
      }
      return;
    }

    for (const node of this.nodes) {
      // Gestion horizontal
      if (node.vx !== 0) {
        node.limitXSpeed(timeStep);
        const vx = node.vx * timeStep;
        node.xp = node.x;
        node.x += vx;

        // Collision droite/gauche
        if (node.vx > 0) {
          if (node.getCellRight(node.x, this.resolution) !== node.getCellRight(node.xp, this.resolution)) {
            const yCells = node.getYCells(this.resolution);
            for (let y = yCells.start; y <= yCells.end; y++) {
              if (this.getWall(node.getCellRight(node.x, this.resolution), y) ||
                  (y !== yCells.start && this.getCeiling(node.getCellRight(node.x, this.resolution), y))) {
                node.collideCellRight(this.resolution);
                break;
              }
            }
          }
        } else {
          if (node.getCellLeft(node.x, this.resolution) !== node.getCellLeft(node.xp, this.resolution)) {
            const yCells = node.getYCells(this.resolution);
            for (let y = yCells.start; y <= yCells.end; y++) {
              if (this.getWall(node.getCellLeft(node.xp, this.resolution), y) ||
                  (y !== yCells.start && this.getCeiling(node.getCellLeft(node.x, this.resolution), y))) {
                node.collideCellLeft(this.resolution);
                break;
              }
            }
          }
        }

        // Gestion friction
        if (node.onGround) {
          const xCells = node.getXCells(this.resolution);
          node.onGround = false;
          for (let x = xCells.start; x <= xCells.end; x++) {
            if (this.getCeiling(x, node.getCellBottom(node.y, this.resolution) + 1) ||
                (x !== xCells.start && this.getWall(x, node.getCellBottom(node.y, this.resolution) + 1))) {
              node.onGround = true;
              break;
            }
          }
        }

        if (node.onGround) {
          if (node.vx > 0) {
            node.vx -= this.friction * timeStep;
            if (node.vx < 0) node.vx = 0;
          } else if (node.vx < 0) {
            node.vx += this.friction * timeStep;
            if (node.vx > 0) node.vx = 0;
          }
        }
      }

      // Gestion vertical
      if (!node.onGround) node.vy += this.gravity * timeStep;

      if (node.vy !== 0) {
        node.limitYSpeed(timeStep);
        const vy = node.vy * timeStep;
        node.yp = node.y;
        node.y += vy;

        if (node.vy > 0) {
          if (node.getCellBottom(node.y, this.resolution) !== node.getCellBottom(node.yp, this.resolution)) {
            const xCells = node.getXCells(this.resolution);
            for (let x = xCells.start; x <= xCells.end; x++) {
              if (this.getCeiling(x, node.getCellBottom(node.y, this.resolution)) ||
                  (x !== xCells.start && this.getWall(x, node.getCellBottom(node.y, this.resolution)))) {
                node.collideCellBottom(this.resolution);
                break;
              }
            }
          }
        } else {
          if (node.getCellTop(node.y, this.resolution) !== node.getCellTop(node.yp, this.resolution)) {
            const xCells = node.getXCells(this.resolution);
            for (let x = xCells.start; x <= xCells.end; x++) {
              if (this.getCeiling(x, node.getCellTop(node.yp, this.resolution)) ||
                  (x !== xCells.start && this.getWall(x, node.getCellTop(node.y, this.resolution)))) {
                node.collideCellTop(this.resolution);
                break;
              }
            }
          }
        }
      }
    }
  }

  drawGrid(context: CanvasRenderingContext2D) {
    context.strokeStyle = this.GRID_STROKE_STYLE;
    context.lineWidth = this.GRID_LINE_WIDTH;

    for (let y = 0; y < this.height; y++) {
      context.beginPath();
      context.moveTo(0, y * this.resolution);
      context.lineTo(this.width * this.resolution, y * this.resolution);
      context.stroke();
    }

    for (let x = 0; x < this.width; x++) {
      context.beginPath();
      context.moveTo(x * this.resolution, 0);
      context.lineTo(x * this.resolution, this.height * this.resolution);
      context.stroke();
    }
  }

  drawNodes(context: CanvasRenderingContext2D) {
    for (const node of this.nodes) {
      context.fillStyle = this.PLAYER_FILL_STYLE;
      context.fillRect(node.x, node.y, node.width, node.height);
    }
  }

  // Dans platformer.ts, à l'intérieur de PlatformerGrid

drawWalls(context: CanvasRenderingContext2D) {
  for (let x = 0; x < this.width; x++) {
    for (let y = 0; y < this.height; y++) {
      const cell = this.getCell(x, y);

      // Mur actif
      if (cell.wall[this.dimension]) {
        context.strokeStyle = this.EDGE_STROKE_STYLE;
        context.globalAlpha = 1;
        context.lineWidth = this.EDGE_LINE_WIDTH;
        context.beginPath();
        context.moveTo(x * this.resolution, (y + 1) * this.resolution);
        context.lineTo(x * this.resolution, y * this.resolution);
        context.stroke();
      }

      // Plafond actif
      if (cell.ceiling[this.dimension]) {
        context.strokeStyle = this.EDGE_STROKE_STYLE;
        context.globalAlpha = 1;
        context.lineWidth = this.EDGE_LINE_WIDTH;
        context.beginPath();
        context.moveTo((x + 1) * this.resolution, y * this.resolution);
        context.lineTo(x * this.resolution, y * this.resolution);
        context.stroke();
      }

      // Objectif
      if (cell.goal) {
        const margin = this.resolution * 0.05;
        const size = this.resolution - margin * 2;
        context.fillStyle = "gold";
        context.globalAlpha = 0.8;
        context.fillRect(
          x * this.resolution + margin,
          y * this.resolution + margin,
          size,
          size
        );
        context.globalAlpha = 1;
      }

      // Mur/plafond inactif
      const inactiveDimension = 1 - this.dimension;
      if (cell.wall[inactiveDimension]) {
        context.strokeStyle = "blue";
        context.globalAlpha = 0.3;
        context.lineWidth = this.EDGE_LINE_WIDTH;
        context.beginPath();
        context.moveTo(x * this.resolution, (y + 1) * this.resolution);
        context.lineTo(x * this.resolution, y * this.resolution);
        context.stroke();
      }

      if (cell.ceiling[inactiveDimension]) {
        context.strokeStyle = "blue";
        context.globalAlpha = 0.3;
        context.lineWidth = this.EDGE_LINE_WIDTH;
        context.beginPath();
        context.moveTo((x + 1) * this.resolution, y * this.resolution);
        context.lineTo(x * this.resolution, y * this.resolution);
        context.stroke();
      }

      context.globalAlpha = 1;
    }
  }
}

/**
 * Dessine la grille complète : murs, nodes, et éventuellement la grille si en mode éditeur
 */
draw(context: CanvasRenderingContext2D, isEditor: boolean) {
  if (isEditor) this.drawGrid(context);
  this.drawWalls(context);
  this.drawNodes(context);
}

}
