import { fadeInMusic } from "./audio.mjs";
import { fadeOutMusic } from "./audio.mjs";
import { startAudio } from "./audio.mjs";
import { introAudio } from "./audio.mjs";
import { boom } from "./audio.mjs";
import { playMusic } from "./audio.mjs";

////////////////
// START MENU //
////////////////

const startButton = document.getElementById("start-button");
const body = document.body;

const introLore = [
    'You awaken in the dark, the echo of dripping water as your only company.',
    'The stone around you breathes with a strange, suffocating nostalgia, as if it remembers more than you do.',
    'Your body is heavy, your mind fractured — memories scatter like broken glass.', // pas essentiel
    'Then, a whisper slithers through the cavern:',
    '“You don\’t belong here… but you cannot leave.”',
    'The voice feels close, too close, as though the shadows themselves are speaking.',
    'Every instinct tells you this cave is alive, and it does not want you to get away.',
    'Only one path forward: survive, remember, escape.',
    'And hurry… before the voice finds you again.'
]


window.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        startButton.classList.add("button-hover");
        startGame();

        // removes the styles and button after its opacity hits 0 
        setTimeout(() => {
            startButton.classList.remove("button-hover");
            startButton.style.display = "none";
        }, buttonAnimation()/2);
    }
});

// function that starts the game (with a few extra steps beforehand)
function startGame() {
    let animationTime = buttonAnimation(); // stores time in ms and launches the button animation 
    setTimeout(() => {
        fadeInMusic(introAudio);
        let introTime = intro(); // stores time in ms and launches the intro
        let totalBeforeTime = introTime + animationTime; // time in ms
        setTimeout(() => {
            fadeOutMusic(introAudio);
            boom.play()
                .then(() => {
                    setTimeout(() => {
                        window.location.href = "game.html";
                    }, 2300);
                })
                .catch((error) => {
                    console.warn(`Music failed: ${error}`);
                    setTimeout(() => {
                        window.location.href = "game.html";
                    }, 2000);
                });
        }, totalBeforeTime);
    }, animationTime);
}

// function that start the button animation 
function buttonAnimation() {
    let transitionTime = 2000; // time in ms
    startButton.style.transform = "scale(200)";
    startButton.style.opacity = "0";
    startButton.style.transition = `transform ${transitionTime}ms ease-in, opacity ${transitionTime/2}ms`;
    fadeOutMusic(startAudio);
    return transitionTime;
}

// function that start the intro 
// output : time of the intro in ms
function intro() {
    // create an #intro div 
    let intro = document.createElement('div');
    intro.id = "intro";
    intro.style.zIndex = "300";
    document.body.appendChild(intro);
    intro = document.getElementById('intro');

    // create an #intro-messages div
    let introMessages = document.createElement('p');
    introMessages.id = "intro-messages";
    introMessages.style.opacity = 0;
    intro.appendChild(introMessages);
    introMessages = document.getElementById('intro-messages');

    let totalDelay = 0;
    introLore.forEach((message) => {
        let displayTime = letterTime(message);
        if (displayTime < 3000) {
            displayTime += 2000;
        } else if (displayTime < 4000) {
            displayTime += 500;
        }
        setTimeout(() => {
            introMessages.textContent = message;
            console.log(`${message}: ${displayTime}`);
            totalDelay += displayTime
            toggleFadeText(introMessages, displayTime);
        }, totalDelay);
        totalDelay += displayTime + 1000;
    });

    return totalDelay;
}

// function that fades in and fades out
// parameters : - element: the element whe want to fade in and out
//              - time: the time before fading out
// output : void
function toggleFadeText(element, time) {
    element.style.opacity = 1; // fade in
    setTimeout(() => {
        element.style.opacity = 0; // fade out
    }, time);
}

// function that calculates the time we need to read a string with how much letters there is inside
// output in ms
function letterTime(string) {
    let parsedString = string.split('');
    let count = 0;
    parsedString.forEach(() => {
        count++;
    });
    console.log(`Time spent reading should be ${count * 50}`);
    return count * 50; // ms per letter we need to read a string
}

