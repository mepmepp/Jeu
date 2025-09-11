// levelLoader.ts
import { PlatformerGrid, PlatformerNode } from "./platformer";

export class LevelLoader {
  game: { grid: PlatformerGrid; player: PlatformerNode };
  currentLevel: number = 1;

  constructor(game: { grid: PlatformerGrid; player: PlatformerNode }) {
    this.game = game;
  }

  /**
   * Charge un niveau JSON depuis le dossier "json/"
   */
  async loadLevel(levelName: string): Promise<void> {
    try {
      const response = await fetch(`json/${levelName}.json`);
      if (!response.ok) throw new Error("Level not found");

      const json = await response.text();
      this.loadLayout(json);

      console.log(`✅ Niveau ${levelName} chargé !`);
    } catch (err) {
      console.error("Erreur lors du chargement du niveau :", err);
    }
  }

  /**
   * Charge un layout JSON dans la grille
   */
  loadLayout(json: string) {
    try {
      const layout = JSON.parse(json);

      // Vérifie la taille de la grille
      if (
        layout.width !== this.game.grid.width ||
        layout.height !== this.game.grid.height ||
        layout.resolution !== this.game.grid.resolution
      ) {
        console.warn("⚠️ Taille de grille différente, recréation forcée !");
        this.game.grid = new PlatformerGrid(
          layout.width,
          layout.height,
          layout.resolution
        );
        this.game.grid.addNode(this.game.player);
      }

      // Copie les cellules
      for (let i = 0; i < layout.cells.length; i++) {
        this.game.grid.cells[i].wall = layout.cells[i].wall;
        this.game.grid.cells[i].ceiling = layout.cells[i].ceiling;
        this.game.grid.cells[i].goal = layout.cells[i].goal || false;
      }

      // Position du joueur
      if (layout.playerSpawn) {
        this.game.player.x = layout.playerSpawn.x * this.game.grid.resolution;
        this.game.player.y = layout.playerSpawn.y * this.game.grid.resolution;
        this.game.player.vx = 0;
        this.game.player.vy = 0;
        this.game.player.onGround = false;
      }

      console.log("✅ Layout chargé !");
    } catch (e) {
      console.error("Erreur lors du parsing du layout :", e);
    }
  }

  /**
   * Charge le niveau suivant
   */
  async nextLevel(): Promise<void> {
    this.currentLevel++;
    await this.loadLevel("level" + this.currentLevel);
  }

  /**
   * Charge le niveau précédent
   */
  async previousLevel(): Promise<void> {
    this.currentLevel = Math.max(1, this.currentLevel - 1);
    await this.loadLevel("level" + this.currentLevel);
  }

  /**
   * Initialisation des contrôles clavier pour changer de niveau
   */
  initKeyboardControls(): void {
    window.addEventListener("keydown", async (e: KeyboardEvent) => {
      if (e.code === "KeyN") {
        console.log("Niveau suivant...");
        await this.nextLevel();
      } else if (e.code === "KeyB") {
        console.log("Niveau précédent...");
        await this.previousLevel();
      }
    });
  }
}
