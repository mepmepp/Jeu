///////////////////////
// FRONT OF THE GAME //
///////////////////////

const pauseMenu = document.getElementById("pause-menu") as HTMLElement | null;
const pauseButton = document.getElementById("pause-button") as HTMLElement | null;
const gameWrapper = document.getElementById("wrapper") as HTMLElement | null;
const gameWrapperChildren: HTMLElement[] = gameWrapper ? Array.from(gameWrapper.children) as HTMLElement[] : [];

let gameIsRunning: boolean = true; // true: game runs / false: game pauses

document.body.style.overflow = "hidden";

window.addEventListener("keydown", (event: KeyboardEvent) => {
    const keyPressed = event.key;
    switch (keyPressed) {
        case "p":
            changeGameState();
            break;
        case "t":
            goToTuto();
        break;
    }
});

function changeGameState(): void {
    if (!pauseMenu || !gameWrapper) return;

    if (gameIsRunning) {
        pauseMenu.style.opacity = "1";
        pauseMenu.style.pointerEvents = "all";
        console.log("Game is paused.");
        gameWrapper.classList.add("blur-effect");
        gameWrapperChildren.forEach((element: HTMLElement) => {
        if (element.id !== "pause-menu") {
            element.classList.add("blur-effect");
            console.log(`Blur effect applied to ${element.id || element.tagName}`);
        }
        });
    } else {
        pauseMenu.style.opacity = "0";
        pauseMenu.style.pointerEvents = "none";
        console.log("Game resumes.");
        document.querySelectorAll(".blur-effect").forEach((element: Element) => {
        (element as HTMLElement).classList.remove("blur-effect");
        console.log(`Blur effect removed from ${(element as HTMLElement).id || element.tagName}`);
        });
    }

    pauseMenu.style.transition = "opacity var(--transition-time) ease-in-out";
    gameIsRunning = !gameIsRunning;
}

function createTutoButton(): void {
    const tutoBtn: HTMLButtonElement = document.createElement("button");
    tutoBtn.id = "skip-intro";
    tutoBtn.className = "button";
    tutoBtn.style.position = "fixed";
    tutoBtn.style.right = "10px";
    tutoBtn.style.top = "10px";
    tutoBtn.textContent = "Tuto";
    document.body.appendChild(tutoBtn);

    tutoBtn.addEventListener("click", goToTuto);
}

createTutoButton();

function goToTuto(): void {
    window.location.href = "tuto.html";
}