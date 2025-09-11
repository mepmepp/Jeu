---

# 🎮 Platformer 2D avec Éditeur de Niveaux

Un moteur de jeu de plateforme en **JavaScript/HTML5** avec un éditeur intégré pour créer, modifier et charger des niveaux.
Projet réalisé dans le cadre du module **Renforcement JS / TS**.

---

## 🚀 Lancer la demo

Se lance avec l'extension Live Server

---

## 📂 Structure du projet

```
/project-root
│
├─ index.html         # Page principale
├─ game.js            # Logique du jeu, joueur, collisions, etc.
├─ platformer.js      # Classes PlatformerGrid, PlatformerNode, etc.
├─ editor.js          # LevelEditor : créer et modifier les niveaux
├─ levelloader.js     # LevelLoader : charger/naviguer entre les niveaux
├─ save.js            # Menu sauvegarde/export/import
├─ json/              # Fichiers JSON des niveaux
│    ├─ level1.json
│    ├─ level2.json
│    └─ ...
├─ sprites/images/    # Images & backgrounds
│    └─ cave.jpg
├─ *.ts               # Version TypeScript des modules
└─ README.md
```

---

## ⚙️ Installation et initialisation

Inclure les scripts dans `index.html` :

```html
<script src="platformer.js"></script>
<script src="editor.js"></script>
<script src="levelloader.js"></script>
<script src="game.js"></script>
<script src="save.js"></script>

<script>
  const game = new Game(true); // true = éditeur, false = jeu
  const editor = new LevelEditor(game);
  game.run();
</script>
```

---

## 🎮 Fonctionnalités

### Gameplay

* Déplacement gauche/droite et saut
* Gravité et friction
* Collisions avec murs et plafonds
* Toggle dimension avec **Space**
* Objectif à atteindre pour passer au niveau suivant
* Chargement automatique du niveau suivant

### Éditeur de niveaux

* Placer/retirer murs, plafonds et goal
* Sauvegarde et exportation JSON
* Importation de fichiers JSON existants
* Menu affiché uniquement en mode éditeur (`isEditor = true`)

### Graphisme

* Background redimensionnable avec le canvas
* Grille visible uniquement en mode éditeur
* Sprite animé pour le joueur

---

## 🕹️ Contrôles

* **W** → Saut
* **A** → Gauche
* **D** → Droite
* **Space** → Changer de dimension
* **P** → Mettre le jeu en pause (visuellement)
* **T** → Accéder au tuto
* **G** → Placer/retirer goal (éditeur)

---

## 💾 Sauvegarde / Chargement

* **Save** → sauvegarde le layout actuel dans la console
* **Export** → télécharge le layout en JSON
* **Load** → importer un fichier JSON existant

Le menu apparaît uniquement si `game.isEditor` est vrai.

---

## 🛠️ Implémentation des contraintes (PDF)

| Catégorie            | Exigence                          | Où utilisé ?                                                          |
| -------------------- | --------------------------------- | --------------------------------------------------------------------- |
| **ES6+**             | `let` / `const`                   | partout dans les fichiers                                             |
|                      | Fonctions fléchées                | `editor.js` → `reader.onload = e => {...}`, `front.js`, `audio.mjs`   |
|                      | Template literals                 | `levelloader.js` → ``console.log(`✅ Niveau ${levelName} chargé !`)`` |
|                      | Destructuring                     | `editor.js` et `levelloader.js` → `const {x, y} = layout.playerSpawn` |
|                      | Spread operator                   | utilisé dans la version TS et `front.js`                              |
|                      | Modules (fichiers séparés)        | `game.js`, `editor.js`, `levelloader.js`, `platformer.js`, `save.js`  |
|                      | Closures                          | `game.js` → compteur de sauts (fonction qui mémorise l’état)          |
|                      | this / bind                       | `game.js` → `this.keyDown.bind(this)`                                 |
| **DOM & événements** | Création DOM                      | `save.js` → `document.createElement("div")`                           |
|                      | Gestion d’événements              | clavier (mouvements), souris (éditeur)                                |
|                      | Modification CSS                  | `save.js` → `menu.style...`, `front.js`, `start-menu.mjs`             |
|                      | Animation (requestAnimationFrame) | `game.js` → `animate()`                                               |
| **Asynchronisme**    | Promises                          | `game.js` → `fetch(...).then(...)`                                    |
|                      | async/await                       | `levelloader.js` → `async loadLevel()`                                |
|                      | try/catch                         | `levelloader.js` → parsing layout                                     |
|                      | Promise.all                       | utilisé en TS (préchargement assets)                                  |
| **TypeScript**       | Interfaces                        | `platformer.ts` → `interface Cell`, `interface Player`                |
|                      | Typage strict                     | partout dans `.ts`                                                    |
|                      | Optional chaining                 | `grid.update()` → `this.game?.loadNextLevel()` en TS                  |
|                      | Union / optionnels                | `save.ts` → `input.files?.[0] ?? null`                                |
| **Architecture**     | Séparation modules                | chaque fonctionnalité dans un fichier dédié                           |
|                      | Gestion d’état                    | `game.js` → `player`, `grid`, `levelCompleted`, `jsonPlayerSpawn`     |
|                      | Commentaires                      | explications présentes dans chaque fichier                            |

---

## 🔜 Améliorations possibles

* Ajouter des ennemis, obstacles et système de scoring
* Plus d'animations pour le personnage
* Éditeur plus complet (sélection de tiles)
* Effets sonores et musique
* Intro et outro : possibilité de skip les messages un par un 
* Accès au tuto sans réinitialisation du jeu
* Bouton restart et quit game fonctionnels

---

## ✅ Licence

Projet personnel / Open source (MIT recommandé)

---

