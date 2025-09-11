import { fadeInMusic, fadeOutMusic, startAudio, introAudio, outroAudio, boom, playMusic } from "./audio.mjs";

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

const outroLore = [
    'On the damp wall, an inscription shimmers faintly — your own name, etched in stone.',
    'The handwriting is familiar, carved with a hand that mirrors yours.',
    'As your eyes trace the letters, a chill runs through you: you have been here before.',
    'The voice was no stranger — it is the echo of your own past, twisted and hungry.',
    'Every step you\'ve taken brought you closer to truth… or to ruin.',
    'The shadows do not lie: you are not just trapped here.',
    'You are the reason this place exists.',
    'And it will not let its master leave so easily.'
]

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

if (window.location.pathname == "/index.html") {
    startButton.addEventListener("click", () => startGame());
}

window.startGame = startGame;

if (window.location.pathname == "/ending.html") {
    window.addEventListener("load", () => {
        endGame();
    });
}

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

///////////////////////
// END GAME FUNCTION 
///////////////////////

export function endGame() {
    fadeInMusic(outroAudio);
    let ontroDiv = document.createElement('div');
    ontroDiv.id = "outro";
    ontroDiv.style.zIndex = "300";
    document.body.appendChild(ontroDiv);

    let ontroMessages = document.createElement('p');
    ontroMessages.id = "intro-messages";
    ontroMessages.style.opacity = 0;
    ontroDiv.appendChild(ontroMessages);

    let totalDelay = 0;
    outroLore.forEach((message) => {
        let displayTime = letterTime(message);
        if (displayTime < 3000) displayTime += 2000;
        else if (displayTime < 4000) displayTime += 500;

        setIntroTimeout(() => {
            ontroMessages.textContent = message;
            toggleFadeText(ontroMessages, displayTime);
        }, totalDelay);

        totalDelay += displayTime + 1000;
    });

    setTimeout(() => {
        fadeOutMusic(outroAudio);
    }, totalDelay);
    return totalDelay;
}

/////////////////////////
// BUTTON ANIMATION
/////////////////////////

function buttonAnimation() {
    let transitionTime = 2000;
    startButton.style.transform = "scale(200)";
    startButton.style.opacity = "0";
    startButton.style.display = "none";
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
    skipBtn.className = "button";
    skipBtn.style.position = "fixed";
    skipBtn.style.right = "10px";
    skipBtn.style.top = "10px";
    skipBtn.textContent = "Skip";
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
