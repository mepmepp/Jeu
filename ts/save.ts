// editorMenu.ts
import { LevelEditor } from "./editor";

declare const editor: LevelEditor; // L'éditeur doit être initialisé ailleurs

window.addEventListener("DOMContentLoaded", () => {
  if (typeof editor === "undefined") return;

  const menu = document.createElement("div");
  menu.id = "menu";
  menu.style.position = "fixed";
  menu.style.top = "10px";
  menu.style.left = "10px";
  menu.style.zIndex = "10";
  menu.style.background = "white";
  menu.style.padding = "8px";
  menu.style.borderRadius = "6px";
  menu.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";

  menu.innerHTML = `
    <button id="saveBtn">💾 Save</button>
    <button id="exportBtn">⬇️ Export</button>
    <input type="file" id="importFile" accept=".json" style="display:none;">
    <button id="loadBtn">📂 Load</button>
  `;

  document.body.appendChild(menu);

  const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
  const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement;
  const loadBtn = document.getElementById("loadBtn") as HTMLButtonElement;
  const importFile = document.getElementById("importFile") as HTMLInputElement;

  saveBtn.addEventListener("click", () => {
    console.log(editor.saveLayout());
    alert("Layout sauvegardé (voir console).");
  });

  exportBtn.addEventListener("click", () => {
    editor.exportLayout();
  });

  loadBtn.addEventListener("click", () => {
    importFile.click();
  });

  importFile.addEventListener("change", (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      editor.importLayout(target.files[0]);
    }
  });
});
