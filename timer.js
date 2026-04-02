// ===============================
// TELA PRETA (PRE-GAME + LOADING)
// ===============================
const startOverlay = document.createElement('div');
startOverlay.id = 'start-overlay';
startOverlay.style.cssText = `
    position:fixed; top:0; left:0;
    width:100%; height:100%;
    background:black;
    display:none;
    justify-content:center;
    align-items:center;
    flex-direction:column;
    z-index:3000;
`;

// Spinner de loading (CSS animation)
const spinner = document.createElement('div');
spinner.id = 'loading-spinner';
spinner.style.cssText = `
    width:48px; height:48px;
    border:4px solid rgba(255,255,255,0.2);
    border-top:4px solid white;
    border-radius:50%;
    animation: spin 0.8s linear infinite;
`;

// Injeta @keyframes no <head>
const spinStyle = document.createElement('style');
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

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
    display:none;
`;

let imageReady = false;

function habilitarIniciar() {
    imageReady = true;
    spinner.style.display = 'none';
    startGameBtn.style.display = 'block';
}

startGameBtn.addEventListener('mouseenter', () => startGameBtn.style.background = '#00cc00');
startGameBtn.addEventListener('mouseleave', () => startGameBtn.style.background = 'green');

startOverlay.appendChild(spinner);
startOverlay.appendChild(startGameBtn);
document.body.appendChild(startOverlay);

// Verifica se a imagem do jogo já carregou
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
// TIMER (com persistência entre sessões)
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

// Tempo acumulado de sessões anteriores + timestamp do início desta sessão
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

// Salva tempo acumulado ao sair da página
window.addEventListener('beforeunload', () => {
    if (sessionStart) {
        localStorage.setItem('longeDeCasa_tempoAcumulado', String(getTempoTotal()));
    }
});

// ===============================
// MOSTRAR TELA PRETA + INICIAR PRELOAD
// ===============================
document.getElementById('advance-button')
    .addEventListener('click', () => {
        setTimeout(() => {
            startOverlay.style.display = 'flex';
            verificarImagemCarregada();
        }, 100);
    });

// ===============================
// INICIAR JOGO (primeira vez)
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
    // Salva tempo final e limpa dados de sessão
    const tempoFinal = getTempoTotal();
    localStorage.setItem('longeDeCasa_tempoAcumulado', String(tempoFinal));
    marcarComoJogou();
    // Limpa dados de jogo em andamento
    localStorage.removeItem('longeDeCasa_jogoIniciado');
    localStorage.removeItem('longeDeCasa_encontrados');
    mostrarScore(tempoFinal);
}

// ===============================
// TELA DE SCORE
// ===============================
function mostrarScore(tempoFinal) {
    const screen = document.createElement('div');
    screen.id = 'score-screen';
    screen.style.cssText = `
        position:fixed; top:0; left:0;
        width:100%; height:100%;
        background:black;
        display:flex; flex-direction:column;
        justify-content:center; align-items:center;
        color:white; z-index:4000;
        padding:20px; box-sizing:border-box;
    `;

    screen.innerHTML = `
        <h2>Tempo: ${formatTime(tempoFinal)}</h2>
        <input id="nome" placeholder="Seu nome (mín. 3 letras)"
            style="padding:10px; font-size:16px; border-radius:6px; border:none; text-align:center; width:250px; max-width:90%;">
        <br><br>
        <button id="save" disabled style="
            padding:12px 24px; font-size:16px; border:none; cursor:pointer;
            background:gray; color:white; border-radius:6px;">
            Salvar Recorde
        </button>
        <br><br>
        <div id="ranking" style="width:100%; max-width:400px;"></div>
        <br>
        <button id="continue" style="
            display:none; padding:12px 24px; font-size:16px; border:none;
            cursor:pointer; background:green; color:white; border-radius:6px;">
            Continuar
        </button>
    `;

    document.body.appendChild(screen);

    const input = document.getElementById('nome');
    const save = document.getElementById('save');
    const cont = document.getElementById('continue');

    input.addEventListener('input', () => {
        const valid = input.value.trim().length >= 3;
        save.disabled = !valid;
        save.style.background = valid ? 'green' : 'gray';
    });

    save.onclick = () => {
        salvar(input.value.trim(), tempoFinal);
        save.style.display = 'none';
        input.style.display = 'none';
        cont.style.display = 'block';
    };

    cont.onclick = () => {
        screen.remove();
        document.getElementById('congrats-modal').style.display = 'flex';
    };

    mostrarRanking();
}

// ===============================
// SALVAR RESULTADO
// ===============================
async function salvar(nome, tempoFinal) {
    // Salva no localStorage como fallback
    let r = JSON.parse(localStorage.getItem('ranking')) || [];
    r.push({ nome, tempo: tempoFinal });
    r.sort((a, b) => a.tempo - b.tempo);
    r = r.slice(0, 50);
    localStorage.setItem('ranking', JSON.stringify(r));

    // Salva no Firebase se disponível
    if (typeof firebaseReady !== 'undefined' && firebaseReady && db) {
        try {
            await db.collection('ranking').add({
                nome: nome,
                tempo: tempoFinal,
                data: new Date().toISOString()
            });
        } catch (err) {
            console.warn('Erro ao salvar no Firebase:', err);
        }
    }

    // Limpa tempo acumulado após salvar
    localStorage.removeItem('longeDeCasa_tempoAcumulado');

    mostrarRanking();
}

// ===============================
// RANKING (TOP 50)
// ===============================
async function mostrarRanking() {
    const div = document.getElementById('ranking');
    if (!div) return;

    let dados = [];

    // Tenta buscar do Firebase
    if (typeof firebaseReady !== 'undefined' && firebaseReady && db) {
        try {
            const snapshot = await db.collection('ranking')
                .orderBy('tempo', 'asc')
                .limit(50)
                .get();

            dados = snapshot.docs.map(doc => doc.data());
        } catch (err) {
            console.warn('Erro ao buscar ranking do Firebase:', err);
            dados = JSON.parse(localStorage.getItem('ranking')) || [];
        }
    } else {
        dados = JSON.parse(localStorage.getItem('ranking')) || [];
    }

    div.innerHTML = '<h3 style="text-align:center; margin-bottom:12px;">Ranking Top 50</h3>';

    if (dados.length === 0) {
        div.innerHTML += '<p style="text-align:center; opacity:0.6;">Nenhum recorde ainda. Seja o primeiro!</p>';
        return;
    }

    const table = document.createElement('table');
    table.style.cssText = 'width:100%; border-collapse:collapse; font-size:14px;';

    table.innerHTML = `
        <thead>
            <tr style="border-bottom:1px solid #333;">
                <th style="padding:6px; text-align:left;">#</th>
                <th style="padding:6px; text-align:left;">Nome</th>
                <th style="padding:6px; text-align:right;">Tempo</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement('tbody');
    dados.forEach((p, i) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #222';

        let medal = '';
        if (i === 0) medal = ' &#129351;';
        else if (i === 1) medal = ' &#129352;';
        else if (i === 2) medal = ' &#129353;';

        tr.innerHTML = `
            <td style="padding:6px;">${i + 1}${medal}</td>
            <td style="padding:6px;">${p.nome}</td>
            <td style="padding:6px; text-align:right;">${formatTime(p.tempo)}</td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    div.appendChild(table);
}

// ===============================
// VERIFICAR RETOMADA DE JOGO
// ===============================
// retomarJogo() é definida em script.js (carregado antes)
// Timer só inicia quando o jogador clica "Continuar Jogo" (callback)
if (typeof retomarJogo === 'function') {
    retomarJogo(iniciarTimer);
}
