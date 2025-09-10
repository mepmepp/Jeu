

class LevelLoader {
  constructor(game) {
    this.game = game;
    this.currentLevel = 1;
  }

  
  async loadLevel(levelName) {
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

  
  loadLayout(json) {
    try {
      const layout = JSON.parse(json);

      
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

      
      for (let i = 0; i < layout.cells.length; i++) {
        this.game.grid.cells[i].wall = layout.cells[i].wall;
        this.game.grid.cells[i].ceiling = layout.cells[i].ceiling;
        this.game.grid.cells[i].goal = layout.cells[i].goal || false;
      }

      
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

  
  async nextLevel() {
    this.currentLevel++;
    await this.loadLevel("level" + this.currentLevel);
  }

  
  async previousLevel() {
    this.currentLevel = Math.max(1, this.currentLevel - 1);
    await this.loadLevel("level" + this.currentLevel);
  }

  
  initKeyboardControls() {
    window.addEventListener("keydown", async (e) => {
      if (e.code === "KeyN") {
        await this.nextLevel();
      } else if (e.code === "KeyP") {
        await this.previousLevel();
      }
    });
  }
}





