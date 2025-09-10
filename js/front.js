// FOR THE START MENU
const startButton = document.getElementById("start-button");
const body = document.body;


function startGame(){
    buttonAnimation();
    let introTime = 2000; // time in ms
    let animationTime = 8000; // time in ms
    let totalBeforeTime = introTime + animationTime; // time in ms
    setTimeout(() => {
        window.location.href = "index.html";
    }, totalBeforeTime);
}

function buttonAnimation() {
    let transitionTime = 2000; // time in ms
    startButton.style.transform = "scale(200)";
    startButton.style.opacity = "0";
    startButton.style.transition = `transform ${transitionTime}ms ease-in, opacity ${transitionTime/2}ms`;
    setTimeout(() => {
        // startButton.style.opacity = 0;
        const intro = document.createElement('div');
        intro.id = "intro";
        intro.style.zIndex = "200";
        intro.textContent = "Hello World !"
    }, transitionTime);

}

// FOR THE GAME 

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
