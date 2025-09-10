class LevelEditor {
  constructor(game) {
    this.game = game;
  }

  
  saveLayout() {
    const layout = {
      width: this.game.grid.width,
      height: this.game.grid.height,
      resolution: this.game.grid.resolution,
      cells: this.game.grid.cells.map(cell => ({
        wall: cell.wall,
        ceiling: cell.ceiling
      }))
    };

    
    return JSON.stringify(layout, null, 2);
  }

  
  loadLayout(json) {
    try {
      const layout = JSON.parse(json);

      
      if (layout.width !== this.game.grid.width ||
    layout.height !== this.game.grid.height ||
    layout.resolution !== this.game.grid.resolution) {
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
      }

      console.log("✅ Layout chargé !");
    } catch (e) {
      console.error("Erreur lors du chargement du layout :", e);
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
