////////////////////////
// GESTION DE L'AUDIO //
////////////////////////

export const gameMusic: HTMLAudioElement = new Audio('sprites/sounds/strange-mist.mp3'); // Peder B. Hellend - Strange Mist
export const startAudio: HTMLAudioElement = new Audio('sprites/sounds/no-more-magic.mp3');
export const introAudio: HTMLAudioElement = new Audio('sprites/sounds/dripping-water.mp3');
export const boom: HTMLAudioElement = new Audio('/sprites/sounds/boom.mp3');
export const outroAudio: HTMLAudioElement = new Audio('/sprites/sounds/hidden-truth.mp3');

if (window.location.pathname === "/index.html") {
    window.addEventListener("load", () => {
        playMusic(startAudio);
    });
}

window.addEventListener("load", () => {
    const location: string = window.location.pathname;
    console.log(`We are here: ${location}.`);
    if (location === "/game.html") {
        playMusic(gameMusic);
    }
});

window.addEventListener("keydown", () => {
    const location: string = window.location.pathname;
    console.log(`We are here: ${location}.`);
    if (location === "/game.html") {
        playMusic(gameMusic);
    }
});

////////////////////////
// AUDIO FUNCTIONS
////////////////////////

export function playMusic(audio: HTMLAudioElement): void {
  audio.volume = 0.3;
  audio.play()
    .then(() => {
      console.log(`${audio.src} is playing!`);
    })
    .catch((error: unknown) => {
      console.warn("Playback failed: ", error);
    });
}

export function fadeInMusic(audio: HTMLAudioElement): void {
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
        .catch((error: unknown) => {
            console.warn("Playback failed: ", error);
        });
        
    console.log(`${audio.src} volume at ${audio.volume}.`);
}

export function fadeOutMusic(audio: HTMLAudioElement): void {
    const fadeOut = setInterval(() => {
        if (audio.volume > 0.1) {
            audio.volume -= 0.1;
        } else {
            audio.volume = 0;
            audio.pause();
            clearInterval(fadeOut);
        }
    }, 100);

    console.log(`${audio.src} volume at ${audio.volume}.`);
}

export function slowlyFadeOutMusic(audio: HTMLAudioElement): void {
    const fadeOut = setInterval(() => {
        if (audio.volume > 0.03) {
        audio.volume = Math.max(audio.volume - 0.03, 0);
        } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeOut);
        }
    }, 100);

    console.log(`${audio.src} volume at ${audio.volume}.`);
}