////////////////////////
// GESTION DE L'AUDIO //
////////////////////////

export const gameMusic = new Audio('sprites/sounds/strange-mist.mp3'); // Peder B. Hellend - Strange Mist
export const startAudio = new Audio('sprites/sounds/no-more-magic.mp3');
export const introAudio = new Audio('sprites/sounds/dripping-water.mp3');
export const boom = new Audio('/sprites/sounds/boom.mp3');

window.addEventListener("load", () => {
    playMusic(startAudio);
});

export function playMusic(audio) {
    audio.play()
        .then(() => {
            console.log(`${audio.src} is playing!`);
        })
        .catch((error) => {
            console.warn("Playback failed: ", error);
    });
}

// function that kind of slowly fades in the music
export function fadeInMusic(audio) {
    audio.volume = 0;
    audio.play()
        .then(() => {
            const fadeIn = setInterval(() => {
                if (audio.volume < 0.94) {
                    audio.volume += 0.05;
                } else {
                    audio.volume = 1.0; 
                    clearInterval(fadeIn);
                }
            }, 100);
            console.log(`${audio.src} is playing!`);
        })
        .catch((error) => {
            console.warn("Playback failed: ", error);
    });
    console.log(`${audio.src} volume at ${audio.volume}.`)
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
    console.log(`${audio} volume at ${audio.volume}.`)
}
