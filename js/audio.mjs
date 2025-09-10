////////////////////////
// GESTION DE L'AUDIO //
////////////////////////

export const gameMusic = new Audio('sprites/sounds/strange-mist.mp3'); // Peder B. Hellend - Strange Mist
export const startAudio = new Audio('sprites/sounds/no-more-magic.mp3');
export const introAudio = new Audio('sprites/sounds/dripping-water.mp3');
export const boom = new Audio('/sprites/sounds/boom.mp3');

window.addEventListener("load", () => {
    startAudio.play();
});

// function that kind of slowly fades in the music
export function fadeInMusic(audio) {
    const fadeIn = setInterval(() => {
        if (audio.volume < 0.94) {
            audio.volume += 0.05;
        } else {
            audio.volume = 1.0; 
            clearInterval(fadeIn);
        }
    }, 100);
}

// function that rapidly fades out the music
export function fadeOutMusic(audio) {
    const fadeOut = setInterval(() => {
        if (audio.volume > 0.1) {
            audio.volume -= 0.1;
        } else {
            audio.volume = 0;
            audio.pause(); 
            clearInterval(fadeOut);
        }
    }, 100);
}
