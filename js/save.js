window.addEventListener("DOMContentLoaded", () => {
  
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

  
  if (typeof game === "undefined" || typeof editor === "undefined") {
    console.error("❌ game ou editor n'existe pas encore !");
    return;
  }

  
  document.getElementById("saveBtn").addEventListener("click", () => {
    console.log(editor.saveLayout());
    alert("Layout sauvegardé (voir console).");
  });

  
  document.getElementById("exportBtn").addEventListener("click", () => {
    editor.exportLayout();
  });

  
  document.getElementById("loadBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });

  
  document.getElementById("importFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      editor.importLayout(file);
    }
  });
});
