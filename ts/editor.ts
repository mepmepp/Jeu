class LevelEditor {
  game: any;
  constructor(game: any) {
    this.game = game;
  }

  saveLayout(): string {
    const layout: Layout = {
      width: this.game.grid.width,
      height: this.game.grid.height,
      resolution: this.game.grid.resolution,
      cells: this.game.grid.cells.map((cell: PlatformerGridCell) => {
        const cellData: any = {};
        for (const key in cell) {
          if (Object.prototype.hasOwnProperty.call(cell, key)) {
            (cellData as any)[key] = (cell as any)[key];
          }
        }
        return cellData as Cell;
      }),
      playerSpawn: {
        x: this.game.player.x / this.game.grid.resolution,
        y: this.game.player.y / this.game.grid.resolution
      }
    };
    return JSON.stringify(layout, null, 2);
  }

  loadLayout(json: string): void {
    try {
      const layout: Layout = JSON.parse(json);

      for (let i = 0; i < layout.cells.length && i < this.game.grid.cells.length; i++) {
        this.game.grid.cells[i].wall = layout.cells[i].wall as [boolean, boolean];
        this.game.grid.cells[i].ceiling = layout.cells[i].ceiling as [boolean, boolean];
        this.game.grid.cells[i].goal = layout.cells[i].goal ?? false;
      }

      if (layout.playerSpawn) {
        const { x, y } = layout.playerSpawn; // destructuring
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

  exportLayout(): void {
    const data = this.saveLayout();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "level.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  importLayout(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const text = e.target?.result as string;
      if (text) this.loadLayout(text);
    };
    reader.readAsText(file);
  }
}
