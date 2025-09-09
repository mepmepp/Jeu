const pauseMenu = document.getElementById("pause-menu");

let gameState = true; // true: game runs / false: game pauses
window.addEventListener("keydown", (event) => {
    let keyPressed = event.key;
    switch (keyPressed) {
        case "p": 
            if (gameState) {
                pauseMenu.style.opacity = "1";
            } else {
                pauseMenu.style.opacity = "0";
            }
            pauseMenu.style.transition = "opacity var(--transition-time) ease-in-out";
            gameState = !gameState;
    }

});
