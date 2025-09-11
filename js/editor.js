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

      for (let i = 0; i < layout.cells.length && i < this.game.grid.cells.length; i++) {
        this.game.grid.cells[i].wall = layout.cells[i].wall;
        this.game.grid.cells[i].ceiling = layout.cells[i].ceiling;
        this.game.grid.cells[i].goal = layout.cells[i].goal || false;
      }

      if (layout.playerSpawn) {
        const { x, y } = layout.playerSpawn; // ✅ destructuration
        this.game.player.x = x * this.game.grid.resolution;
        this.game.player.y = y * this.game.grid.resolution;
        this.game.player.vx = 0;
        this.game.player.vy = 0;
        this.game.player.onGround = false;
        this.game.jsonPlayerSpawn = { x: this.game.player.x, y: this.game.player.y };
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
