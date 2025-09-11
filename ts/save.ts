window.addEventListener("DOMContentLoaded", () => {
  const checkGame = setInterval(() => {
    // On vérifie que game et editor sont bien disponibles en global
    const w = window as any;
    if (w.game && w.editor) {
      clearInterval(checkGame);

      if (!w.game.isEditor) return;

      const menu = document.createElement("div");
      menu.id = "menu";
      Object.assign(menu.style, {
        position: "fixed",
        top: "10px",
        left: "10px",
        zIndex: "10",
        background: "white",
        padding: "8px",
        borderRadius: "6px",
        boxShadow: "0 0 5px rgba(0,0,0,0.3)"
      } as CSSStyleDeclaration);

      menu.innerHTML = `
        <button id="saveBtn">💾 Save</button>
        <button id="exportBtn">⬇️ Export</button>
        <input type="file" id="importFile" accept=".json" style="display:none;">
        <button id="loadBtn">📂 Load</button>
      `;
      document.body.appendChild(menu);

      (document.getElementById("saveBtn") as HTMLButtonElement).addEventListener("click", () => {
        console.log(w.editor?.saveLayout()); // optional chaining
        alert("Layout sauvegardé (voir console).");
      });

      (document.getElementById("exportBtn") as HTMLButtonElement).addEventListener("click", () => {
        w.editor?.exportLayout();
      });

      (document.getElementById("loadBtn") as HTMLButtonElement).addEventListener("click", () => {
        (document.getElementById("importFile") as HTMLInputElement).click();
      });

      (document.getElementById("importFile") as HTMLInputElement).addEventListener("change", (e: Event) => {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0] ?? null; // union + optionnel
        if (file) w.editor?.importLayout(file);
      });
    }
  }, 100);
});
