///////////////////////
// FRONT OF THE GAME //
///////////////////////

const pauseMenu = document.getElementById("pause-menu");
const pauseButton = document.getElementById("pause-button");
const gameWrapper = document.getElementById("wrapper");
const gameWrapperChildren = [...gameWrapper.children];

let gameIsRunning = true; // true: game runs / false: game pauses

window.addEventListener("keydown", (event) => {
    let keyPressed = event.key;
    switch (keyPressed) {
        case "p": 
            changeGameState();
    }

});

function changeGameState(){
    if (gameIsRunning) {
        pauseMenu.style.opacity = "1";
        pauseMenu.style.pointerEvents = "all";
        console.log("Game is paused.");
        gameWrapper.classList.add('blur-effect');
        gameWrapperChildren.forEach((element) => {
            if (element.id !== "pause-menu") {
                element.classList.add('blur-effect');
                console.log(`Blur effect applied to ${element.id || element.tagName}`);
            };
        });
    } else {
        pauseMenu.style.opacity = "0";
        pauseMenu.style.pointerEvents = "none";
        console.log("Game resumes.");
        document.querySelectorAll('.blur-effect').forEach((element) => {
            element.classList.remove('blur-effect');
            console.log(`Blur effect removed from ${element.id || element.tagName}`);
        });
    }
    pauseMenu.style.transition = "opacity var(--transition-time) ease-in-out";
    gameIsRunning = !gameIsRunning;
}
