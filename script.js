// ===============================
// ELEMENTOS
// ===============================
const startButton = document.getElementById('start-button');
const startScreen = document.getElementById('start-screen');
const previewScreen = document.getElementById('preview-screen');
const advanceButton = document.getElementById('advance-button');
const backButton = document.getElementById('back-button');
const gameContainer = document.getElementById('game-container');
const gameWrapper = document.getElementById('game-wrapper');
const gameImage = document.getElementById('game-image');
const hotspots = document.querySelectorAll('.hotspot');
const counter = document.getElementById('counter');
const musicToggle = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');


// NOVOS ELEMENTOS
const introScreen = document.getElementById('intro-screen');
const introBack = document.getElementById('intro-back');
const introAdvance = document.getElementById('intro-advance');
const previewBack = document.getElementById('preview-back');

let foundCount = 0;
const totalObjects = hotspots.length;
window.panzoomInstance = null;
let isDragging = false;

// ===============================
// BLOQUEIO DE TENTATIVA
// ===============================
function jaJogou() {
    return localStorage.getItem('longeDeCasa_jogou') === 'true';
}

function marcarComoJogou() {
    localStorage.setItem('longeDeCasa_jogou', 'true');
}

// ===============================
// NAVEGACAO DE TELAS
// ===============================
if (jaJogou()) {
    setTimeout(() => {
        const tempoFinal = localStorage.getItem('longeDeCasa_tempoFinal');
        if (tempoFinal) {
            startScreen.style.display = 'none';
            mostrarScore(parseInt(tempoFinal));
        } else {
            mostrarBloqueio();
        }
    }, 0);
}

// ALTERADO: agora vai para intro
startButton.addEventListener('click', () => {
    if (jaJogou()) {
        const tempoFinal = localStorage.getItem('longeDeCasa_tempoFinal');
        if (tempoFinal) {
            startScreen.style.display = 'none';
            mostrarScore(parseInt(tempoFinal));
        } else {
            mostrarBloqueio();
        }
        return;
    }
    startScreen.style.display = 'none';
    introScreen.style.display = 'block';
});

// NOVO: intro navegação
introBack.addEventListener('click', () => {
    introScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});

introAdvance.addEventListener('click', () => {
    introScreen.style.display = 'none';
    previewScreen.style.display = 'flex';
});

// RESTANTE IGUAL
advanceButton.addEventListener('click', () => {
    previewScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    iniciarPanzoom();
    iniciarMusica();
});
previewBack.addEventListener('click', () => {
    previewScreen.style.display = 'none';
    introScreen.style.display = 'block';
});

backButton.addEventListener('click', () => {
    location.reload();
});

