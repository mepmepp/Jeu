import { fadeInMusic, fadeOutMusic, startAudio, introAudio, boom, playMusic } from "./audio.mjs";

////////////////
// START MENU //
////////////////

const startButton = document.getElementById("start-button");
const body = document.body;

const introLore = [
    'You awaken in the dark, the echo of dripping water as your only company.',
    'The stone around you breathes with a strange, suffocating nostalgia, as if it remembers more than you do.',
    'Your body is heavy, your mind fractured — memories scatter like broken glass.',
    'Then, a whisper slithers through the cavern:',
    '“You don\’t belong here… but you cannot leave.”',
    'The voice feels close, too close, as though the shadows themselves are speaking.',
    'Every instinct tells you this cave is alive, and it does not want you to get away.',
    'Only one path forward: survive, remember, escape.',
    'And hurry… before the voice finds you again.'
];

let introTimeouts = []; // pour stocker les setTimeout de l'intro

/////////////////////////
// START GAME LISTENERS
/////////////////////////

window.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        startButton.classList.add("button-hover");
        startGame();
        setTimeout(() => {
            startButton.classList.remove("button-hover");
            startButton.style.display = "none";
        }, buttonAnimation() / 2);
    }
});

startButton.addEventListener("click", () => startGame());

window.startGame = startGame;

/////////////////////////
// START GAME FUNCTION
/////////////////////////

export function startGame() {
    let animationTime = buttonAnimation();
    setTimeout(() => {
        fadeInMusic(introAudio);
        let introTime = intro();
        let totalBeforeTime = introTime + animationTime;
        setTimeout(() => {
            fadeOutMusic(introAudio);
            boom.play()
                .then(() => setTimeout(() => window.location.href = "game.html", 2300))
                .catch(() => setTimeout(() => window.location.href = "game.html", 2000));
        }, totalBeforeTime);
    }, animationTime);
}

/////////////////////////
// BUTTON ANIMATION
/////////////////////////

function buttonAnimation() {
    let transitionTime = 2000;
    startButton.style.transform = "scale(200)";
    startButton.style.opacity = "0";
    startButton.style.transition = `transform ${transitionTime}ms ease-in, opacity ${transitionTime / 2}ms`;
    fadeOutMusic(startAudio);
    return transitionTime;
}

/////////////////////////
// INTRO FUNCTION
/////////////////////////

function setIntroTimeout(fn, delay) {
    const id = setTimeout(fn, delay);
    introTimeouts.push(id);
    return id;
}

function clearIntroTimeouts() {
    introTimeouts.forEach((id) => clearTimeout(id));
    introTimeouts = [];
}

function intro() {
    let introDiv = document.createElement('div');
    introDiv.id = "intro";
    introDiv.style.zIndex = "300";
    document.body.appendChild(introDiv);

    let introMessages = document.createElement('p');
    introMessages.id = "intro-messages";
    introMessages.style.opacity = 0;
    introDiv.appendChild(introMessages);

    createSkipButton();

    let totalDelay = 0;
    introLore.forEach((message) => {
        let displayTime = letterTime(message);
        if (displayTime < 3000) displayTime += 2000;
        else if (displayTime < 4000) displayTime += 500;

        setIntroTimeout(() => {
            introMessages.textContent = message;
            toggleFadeText(introMessages, displayTime);
        }, totalDelay);

        totalDelay += displayTime + 1000;
    });

    return totalDelay;
}

/////////////////////////
// TOGGLE FADE TEXT
/////////////////////////

function toggleFadeText(element, time) {
    element.style.opacity = 1;
    setTimeout(() => {
        element.style.opacity = 0;
    }, time);
}

/////////////////////////
// LETTER TIME
/////////////////////////

function letterTime(string) {
    let count = string.length;
    return count * 50;
}

/////////////////////////
// SKIP BUTTON
/////////////////////////

function createSkipButton() {
    const skipBtn = document.createElement('button');
    skipBtn.id = "skip-intro";
    skipBtn.textContent = "Skip Intro";
    skipBtn.style.position = "fixed";
    skipBtn.style.top = "20px";
    skipBtn.style.right = "20px";
    skipBtn.style.zIndex = 500;
    skipBtn.style.padding = "10px 20px";
    skipBtn.style.fontSize = "16px";
    skipBtn.style.cursor = "pointer";
    document.body.appendChild(skipBtn);

    skipBtn.addEventListener("click", skipIntro);
}

function skipIntro() {
    clearIntroTimeouts();
    fadeOutMusic(introAudio);
    boom.play()
        .then(() => setTimeout(() => window.location.href = "game.html", 2300))
        .catch(() => setTimeout(() => window.location.href = "game.html", 2000));

    const introDiv = document.getElementById("intro");
    if (introDiv) introDiv.remove();

    const skipBtn = document.getElementById("skip-intro");
    if (skipBtn) skipBtn.remove();
}
