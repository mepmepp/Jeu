

# 🎮 Platformer 2D avec Éditeur de Niveaux

Un moteur de jeu de plateforme en JavaScript/HTML5 avec un éditeur intégré pour créer, modifier et charger des niveaux.

---

## 📂 Structure du projet

```

/project-root
│
├─ index.html         # Page principale
├─ game.js            # Logique du jeu, joueur, collisions, etc.
├─ platformer.js      # Classes PlatformerGrid, PlatformerNode, etc.
├─ editor.js          # LevelEditor : créer et modifier les niveaux
├─ loader.js          # LevelLoader : charger/naviguer entre les niveaux
├─ save.js            # Menu sauvegarde/export/import
├─ json/              # Fichiers JSON des niveaux
│    ├─ level1.json
│    ├─ level2.json
│    └─ ...
├─ sprites/images/    # Images & backgrounds
│    └─ cave.jpg
└─ README.md

````

---

## ⚙️ Installation et initialisation

Inclure les scripts dans `index.html` :

```html
<script src="platformer.js"></script>
<script src="game.js"></script>
<script src="editor.js"></script>
<script src="loader.js"></script>
<script src="save.js"></script>
<script>
  const game = new Game(true); // true = éditeur, false = jeu
  game.run();
  const editor = new LevelEditor(game);
</script>
````

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

* Background avec image adaptable à la taille du canvas
* Grille visible uniquement en mode éditeur
* Player et murs rendus dynamiquement

---

## 🕹️ Contrôles

* **Z** → Saut
* **Q** → Gauche
* **D** → Droite
* **Space** → Changer de dimension
* **G** → Placer/retirer goal (éditeur)


---

## 💾 Sauvegarde / Chargement

* **Save** → sauvegarde le layout actuel dans la console
* **Export** → télécharge le layout en JSON
* **Load** → importer un fichier JSON existant

> Le menu apparaît uniquement si `game.isEditor` est vrai.

---

## 🛠️ Notes techniques

* Canvas redimensionnable, mais le nombre de colonnes (`COLUMNS`) et lignes (`ROWS`) reste fixe pour garantir la compatibilité des niveaux.
* La grille gère collisions et rendu des murs/ceilings.
* Menu `save.js` indépendant, lié à l’instance de jeu pour vérifier `isEditor`.

---

## 🔜 Améliorations possibles

* Ajouter des ennemis et obstacles
* PLus d'animations pour le personnage
* Editeur plus complet
* Effets sonores et musique

---

## ✅ Licence

Projet personnel / Open source (MIT recommandé)

```

