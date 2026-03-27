// ===============================
// TELA PRETA
// ===============================

const startOverlay = document.createElement('div');
startOverlay.style.cssText = `
position:fixed;
top:0;left:0;
width:100%;height:100%;
background:black;
display:none;
justify-content:center;
align-items:center;
z-index:3000;
`;

const startGameBtn = document.createElement('button');
startGameBtn.innerText = "Iniciar";
startGameBtn.style.cssText = `
padding:20px 50px;
font-size:22px;
background:green;
color:white;
border:none;
border-radius:12px;
cursor:pointer;
`;

startOverlay.appendChild(startGameBtn);
document.body.appendChild(startOverlay);

// ===============================
// TIMER
// ===============================

const timerDisplay = document.createElement('div');
timerDisplay.innerText = "00:00";
timerDisplay.style.cssText = `
position:fixed;
bottom:20px;
right:20px;
background:rgba(0,0,0,0.6);
color:white;
padding:8px 14px;
border-radius:8px;
`;

document.body.appendChild(timerDisplay);

let time = 0;
let interval = null;

function formatTime(s) {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
}

// ===============================
// MOSTRAR TELA PRETA
// ===============================

window.addEventListener('load', () => {
    document.getElementById('advance-button')
        .addEventListener('click', () => {
            setTimeout(() => {
                startOverlay.style.display = 'flex';
            }, 100);
        });
});

// ===============================
// INICIAR JOGO
// ===============================

startGameBtn.addEventListener('click', () => {
    startOverlay.style.display = 'none';

    interval = setInterval(() => {
        time++;
        timerDisplay.innerText = formatTime(time);
    }, 1000);
});

// ===============================
// FINAL DO JOGO
// ===============================

function finalizarJogo() {
    clearInterval(interval);

    localStorage.setItem('jaJogou', 'true');

    mostrarScore();
}

// ===============================
// TELA DE SCORE
// ===============================

function mostrarScore() {
    const screen = document.createElement('div');

    screen.style.cssText = `
    position:fixed;
    top:0;left:0;
    width:100%;height:100%;
    background:black;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    color:white;
    z-index:4000;
    `;

    screen.innerHTML = `
        <h2>Tempo: ${formatTime(time)}</h2>

        <input id="nome" placeholder="Seu nome (mín. 3 letras)">
        <br><br>

        <button id="save" disabled>Salvar Recorde</button>
        <br><br>

        <div id="ranking"></div>

        <br>

        <button id="continue" style="display:none;">Continuar</button>
    `;

    document.body.appendChild(screen);

    const input = document.getElementById('nome');
    const save = document.getElementById('save');
    const cont = document.getElementById('continue');

    input.addEventListener('input', () => {
        save.disabled = input.value.trim().length < 3;
    });

    save.onclick = () => {
        salvar(input.value);

        save.style.display = 'none';
        cont.style.display = 'block';
    };

    cont.onclick = () => {
        screen.remove();
        document.getElementById('congrats-modal').style.display = 'flex';
    };

    mostrarRanking();
}

// ===============================
// RANKING LOCAL
// ===============================

function salvar(nome) {
    let r = JSON.parse(localStorage.getItem('ranking')) || [];

    r.push({ nome, tempo: time });

    r.sort((a, b) => a.tempo - b.tempo);
    r = r.slice(0, 5);

    localStorage.setItem('ranking', JSON.stringify(r));

    mostrarRanking();
}

function mostrarRanking() {
    const div = document.getElementById('ranking');
    let r = JSON.parse(localStorage.getItem('ranking')) || [];

    div.innerHTML = "<h3>🏆 Ranking</h3>";

    r.forEach((p, i) => {
        const el = document.createElement('div');
        el.innerText = `${i + 1}. ${p.nome} - ${formatTime(p.tempo)}`;
        div.appendChild(el);
    });
}