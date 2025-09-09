const pauseMenu = document.getElementById("pause-menu");

let pPressed = true;
window.addEventListener("keydown", (event) => {
    let keyPressed = event.key;
    switch (keyPressed) {
        case "p": 
            if (pPressed) {
                pauseMenu.style.opacity = "1";
            } else {
                pauseMenu.style.opacity = "0";
            }
            pauseMenu.style.transition = "opacity var(--transition-time) ease-in-out";
            pPressed = !pPressed;
    }
});

// function resumeGame() {
//     window.location.href = "game.html";
// }