const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const previewScreen = document.getElementById('preview-screen');
const advanceButton = document.getElementById('advance-button');
const backButton = document.getElementById('back-button');
const gameContainer = document.getElementById('game-container');

const hotspots = document.querySelectorAll('.hotspot');
const counter = document.getElementById('counter');

let foundCount = 0;
const totalObjects = hotspots.length;

startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    previewScreen.style.display = 'flex';
});

advanceButton.addEventListener('click', () => {
    previewScreen.style.display = 'none';
    gameContainer.style.display = 'block';
});

backButton.addEventListener('click', () => {
    location.reload();
});

hotspots.forEach(hotspot => {
    hotspot.addEventListener('click', function () {
        if (this.classList.contains('found')) return;

        this.classList.add('found');

        foundCount++;
        counter.textContent = `${foundCount} / ${totalObjects}`;

        if (foundCount === totalObjects) {
            finalizarJogo();
        }
    });
});