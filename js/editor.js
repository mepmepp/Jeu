
class LevelEditor {
  constructor(game) {
    this.game = game;
  }

  
  saveLayout() {
    const layout = {
      width: this.game.grid.width,
      height: this.game.grid.height,
      resolution: this.game.grid.resolution,
      cells: this.game.grid.cells.map(cell => {
        const cellData = {};
        for (const key in cell) {
          if (cell.hasOwnProperty(key)) {
            cellData[key] = cell[key]; 
          }
        }
        return cellData;
      }),
      
      playerSpawn: {
        x: this.game.player.x / this.game.grid.resolution,
        y: this.game.player.y / this.game.grid.resolution
      }
      
    };
    return JSON.stringify(layout, null, 2);
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
        const cell = layout.cells[i];
        for (const key in cell) {
          if (cell.hasOwnProperty(key)) {
            this.game.grid.cells[i][key] = cell[key];
          }
        }
      }

      
      if (layout.playerSpawn) {
        this.game.player.x = layout.playerSpawn.x * this.game.grid.resolution;
        this.game.player.y = layout.playerSpawn.y * this.game.grid.resolution;
        this.game.player.vx = 0;
        this.game.player.vy = 0;
        this.game.player.onGround = false;
        this.game.jsonPlayerSpawn = {
    x: layout.playerSpawn.x * this.game.grid.resolution,
    y: layout.playerSpawn.y * this.game.grid.resolution
  };
      }

      console.log("✅ Layout chargé !");
    } catch (e) {
      console.error("Erreur lors du parsing du layout :", e);
    }
  }

  
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

  
  importLayout(file) {
    const reader = new FileReader();
    reader.onload = e => {
      this.loadLayout(e.target.result);
    };
    reader.readAsText(file);
  }
}
