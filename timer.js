// ===============================
// TELA PRETA (AGORA VEM DO HTML)
// ===============================
const startOverlay = document.getElementById('start-overlay');
const spinner = document.getElementById('loading-spinner');
const startGameBtn = document.getElementById('start-game-btn');

function habilitarIniciar() {
    spinner.style.display = 'none';
    startGameBtn.style.display = 'block';
}

// ===============================
// VERIFICA SE IMAGEM CARREGOU
// ===============================
function verificarImagemCarregada() {
    const img = document.getElementById('game-image');

    if (img.complete && img.naturalHeight > 0) {
        habilitarIniciar();
    } else {
        img.addEventListener('load', habilitarIniciar);

        img.addEventListener('error', () => {
            spinner.style.display = 'none';

            const errMsg = document.createElement('p');
            errMsg.style.cssText = 'color:red; font-size:16px;';
            errMsg.innerText = 'Erro ao carregar imagem. Recarregue a página.';

            startOverlay.appendChild(errMsg);
        });
    }
}

// ===============================
// TIMER
// ===============================
const timerDisplay = document.createElement('div');
timerDisplay.id = 'timer-display';
timerDisplay.innerText = "00:00";
timerDisplay.style.cssText = `
    position:fixed;
    bottom:20px; right:20px;
    background:rgba(0,0,0,0.6);
    color:white;
    padding:8px 14px;
    border-radius:8px;
    font-size:16px;
    z-index:20;
    display:none;
`;
document.body.appendChild(timerDisplay);

let acumulado = parseInt(localStorage.getItem('longeDeCasa_tempoAcumulado')) || 0;
let sessionStart = null;
let interval = null;

function getTempoTotal() {
    if (!sessionStart) return acumulado;
    return acumulado + Math.floor((Date.now() - sessionStart) / 1000);
}

function formatTime(s) {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
}

function iniciarTimer() {
    sessionStart = Date.now();
    timerDisplay.style.display = 'block';
    timerDisplay.innerText = formatTime(getTempoTotal());

    interval = setInterval(() => {
        timerDisplay.innerText = formatTime(getTempoTotal());
    }, 1000);
}

window.addEventListener('beforeunload', () => {
    if (sessionStart) {
        localStorage.setItem('longeDeCasa_tempoAcumulado', String(getTempoTotal()));
    }
});

// ===============================
// MOSTRAR TELA PRETA
// ===============================
document.getElementById('advance-button')
    .addEventListener('click', () => {
        setTimeout(() => {
            startOverlay.style.display = 'flex';
            verificarImagemCarregada();
        }, 100);
    });

// ===============================
// INICIAR JOGO
// ===============================
startGameBtn.addEventListener('click', () => {
    startOverlay.style.display = 'none';
    localStorage.setItem('longeDeCasa_jogoIniciado', 'true');
    iniciarTimer();
});

// ===============================
// FINAL DO JOGO
// ===============================
function finalizarJogo() {
    clearInterval(interval);
    const tempoFinal = getTempoTotal();

    localStorage.setItem('longeDeCasa_tempoAcumulado', String(tempoFinal));
    localStorage.setItem('longeDeCasa_tempoFinal', String(tempoFinal));

    marcarComoJogou();

    localStorage.removeItem('longeDeCasa_jogoIniciado');
    localStorage.removeItem('longeDeCasa_encontrados');

    mostrarScore(tempoFinal);
}

// ===============================
// SCORE
// ===============================
function mostrarScore(tempoFinal) {
    const screen = document.createElement('div');

    screen.id = 'score-screen';
    screen.style.cssText = `
        position:fixed; top:0; left:0;
        width:100%; height:100%;
        background:black;
        display:flex; flex-direction:column;
        align-items:center;
        color:white; z-index:4000;
        padding:40px 20px;
        box-sizing:border-box;
        overflow-y:auto;
    `;

    screen.innerHTML = `
        <h2>Tempo: ${formatTime(tempoFinal)}</h2>

        <input id="nome" placeholder="Seu nome (mín. 3 letras)"
        style="padding:10px; font-size:16px; border-radius:6px; border:none; text-align:center; width:250px;">

        <br><br>

        <button id="save" disabled style="
            padding:12px 24px;
            font-size:16px;
            background:gray;
            color:white;
            border:none;
            border-radius:6px;">
            Salvar Recorde
        </button>

        <br><br>

        <button id="continue" style="
            display:none;
            padding:12px 24px;
            font-size:16px;
            background:green;
            color:white;
            border:none;
            border-radius:6px;">
            Continuar
        </button>

        <div id="ranking"></div>
    `;

    document.body.appendChild(screen);

    const input = document.getElementById('nome');
    const save = document.getElementById('save');
    const cont = document.getElementById('continue');

    let nomeJogador = '';

    input.addEventListener('input', () => {
        const valid = input.value.trim().length >= 3;
        save.disabled = !valid;
        save.style.background = valid ? 'green' : 'gray';
    });

    save.onclick = () => {
        nomeJogador = input.value.trim();
        localStorage.setItem('longeDeCasa_nomeJogador', nomeJogador);

        salvar(nomeJogador, tempoFinal);

        save.style.display = 'none';
        input.style.display = 'none';
        cont.style.display = 'block';
    };

    cont.onclick = () => {
        screen.remove();
        mostrarPresave();
    };

    mostrarRanking(nomeJogador);
}

// ===============================
// PRESAVE
// ===============================
function mostrarPresave() {
    const modal = document.getElementById('congrats-modal');

    modal.innerHTML = '';
    modal.style.display = 'flex';

    const content = document.createElement('div');

    content.className = 'modal-content';
    content.innerHTML = `
        <h2>Parabéns! Você encontrou todos!</h2>

        <a href="https://sym.ffm.to/longedecasa_" target="_blank" class="pre-save-btn">
            Presave
        </a>
    `;

    modal.appendChild(content);
}

// ===============================
// SALVAR
// ===============================
async function salvar(nome, tempoFinal) {
    let r = JSON.parse(localStorage.getItem('ranking')) || [];

    r.push({ nome, tempo: tempoFinal });
    r.sort((a, b) => a.tempo - b.tempo);
    r = r.slice(0, 50);

    localStorage.setItem('ranking', JSON.stringify(r));

    mostrarRanking(nome);
}

// ===============================
// RANKING
// ===============================
function mostrarRanking(nomeJogador) {
    const div = document.getElementById('ranking');

    if (!div) return;

    let dados = JSON.parse(localStorage.getItem('ranking')) || [];

    div.innerHTML = '<h3>Ranking</h3>';

    dados.forEach((p, i) => {
        div.innerHTML += `<p>${i + 1}. ${p.nome} - ${formatTime(p.tempo)}</p>`;
    });
}

// ===============================
// RETOMADA
// ===============================
if (typeof retomarJogo === 'function') {
    retomarJogo(iniciarTimer);
}