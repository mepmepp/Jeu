// editor.ts
import { Game } from "./game";
import { PlatformerGridCell } from "./platformer";

export class LevelEditor {
  game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  /**
   * Sauvegarde le layout actuel de la grille et du joueur en JSON
   */
  saveLayout(): string {
    const layout = {
      width: this.game.grid.width,
      height: this.game.grid.height,
      resolution: this.game.grid.resolution,
      cells: this.game.grid.cells.map((cell: PlatformerGridCell) => ({
        wall: cell.wall,
        ceiling: cell.ceiling,
        goal: cell.goal
      })),
      playerSpawn: {
        x: this.game.player.x / this.game.grid.resolution,
        y: this.game.player.y / this.game.grid.resolution
      }
    };
    return JSON.stringify(layout, null, 2);
  }

  /**
   * Charge un layout JSON dans la grille existante
   */
  loadLayout(json: string) {
    try {
      const layout = JSON.parse(json);

      for (let i = 0; i < layout.cells.length && i < this.game.grid.cells.length; i++) {
        const cell = layout.cells[i];
        this.game.grid.cells[i].wall = cell.wall;
        this.game.grid.cells[i].ceiling = cell.ceiling;
        this.game.grid.cells[i].goal = cell.goal || false;
      }

      if (layout.playerSpawn) {
        this.game.player.x = layout.playerSpawn.x * this.game.grid.resolution;
        this.game.player.y = layout.playerSpawn.y * this.game.grid.resolution;
        this.game.player.vx = 0;
        this.game.player.vy = 0;
        this.game.player.onGround = false;
        this.game.jsonPlayerSpawn = {
          x: this.game.player.x,
          y: this.game.player.y
        };
      }

      console.log("✅ Layout chargé !");
    } catch (e) {
      console.error("Erreur lors du parsing du layout :", e);
    }
  }

  /**
   * Export du layout en fichier JSON
   */
  exportLayout() {
    const data = this.saveLayout();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "level.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Import d'un fichier JSON et chargement du layout
   */
  importLayout(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result;
      if (typeof result === "string") {
        this.loadLayout(result);
      }
    };
    reader.readAsText(file);
  }
}
