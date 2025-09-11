const characterSprite = new Image();
characterSprite.src = 'sprites/images/owlet/walk6.png';

characterSprite.onload = function () {
      console.log(`Image dimensions: ${characterSprite.naturalWidth} x ${characterSprite.naturalHeight}`);
}