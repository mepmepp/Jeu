type Layout = {
  width: number;
  height: number;
  resolution: number;
  cells: Cell[];
  playerSpawn?: { x: number; y: number };
};

class LevelLoader {
  game: any;
  currentLevel = 1;

  constructor(game: any) {
    this.game = game;
  }

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

  loadLayout(json: string): void {
    try {
      const layout: Layout = JSON.parse(json);

      if (
        layout.width !== this.game.grid.width ||
        layout.height !== this.game.grid.height ||
        layout.resolution !== this.game.grid.resolution
      ) {
        console.warn("⚠️ Taille de grille différente, recréation forcée !");
        this.game.grid = new PlatformerGrid(layout.width, layout.height, layout.resolution);
        this.game.grid.addNode(this.game.player);
      }

      for (let i = 0; i < layout.cells.length; i++) {
        this.game.grid.cells[i].wall = layout.cells[i].wall as [boolean, boolean];
        this.game.grid.cells[i].ceiling = layout.cells[i].ceiling as [boolean, boolean];
        this.game.grid.cells[i].goal = layout.cells[i].goal ?? false; // optional chaining/?? combo
      }

      if (layout.playerSpawn) {
        const { x, y } = layout.playerSpawn; // destructuring
        this.game.player.x = x * this.game.grid.resolution;
        this.game.player.y = y * this.game.grid.resolution;
        this.game.player.vx = 0;
        this.game.player.vy = 0;
        this.game.player.onGround = false;
      }

      console.log("✅ Layout chargé !");
    } catch (e) {
      console.error("Erreur lors du parsing du layout :", e);
    }
  }

  async nextLevel(): Promise<void> {
    this.currentLevel++;
    await this.loadLevel("level" + this.currentLevel);
  }

  async previousLevel(): Promise<void> {
    this.currentLevel = Math.max(1, this.currentLevel - 1);
    await this.loadLevel("level" + this.currentLevel);
  }

  initKeyboardControls(): void {
    window.addEventListener("keydown", async (e: KeyboardEvent) => {
      if (e.code === "KeyN") {
        console.log("Niveau suivant...");
        await this.nextLevel();
      } else if (e.code === "KeyB") {
        await this.previousLevel();
      }
    });
  }

  // Optionnel : préchargement d’assets en parallèle (Promise.all)
  preloadAssets(sources: string[]): Promise<(HTMLImageElement | null)[]> {
    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Image introuvable: " + src));
        img.src = src;
      });

    return Promise.all(sources.map(s => loadImage(s).catch(() => null as unknown as HTMLImageElement)));
  }
}
