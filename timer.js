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
    const tempoFinal = getTempoTotal();
    localStorage.setItem('longeDeCasa_tempoAcumulado', String(tempoFinal));
    localStorage.setItem('longeDeCasa_tempoFinal', String(tempoFinal));
    marcarComoJogou();
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
        align-items:center;
        color:white; z-index:4000;
        padding:40px 20px; box-sizing:border-box;
        overflow-y:auto; -webkit-overflow-scrolling:touch;
    `;

    screen.innerHTML = `
        <h2>Tempo: ${formatTime(tempoFinal)}</h2>

        <div id="login-options" style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin:12px 0;">
            <button id="google-login" style="
                padding:10px 18px; font-size:14px; border:none; cursor:pointer;
                background:white; color:#444; border-radius:8px; font-weight:bold;
                display:flex; align-items:center; gap:8px;
            ">
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#34A853" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Google
            </button>
            <button id="ig-login" style="
                padding:10px 18px; font-size:14px; border:none; cursor:pointer;
                background:linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
                color:white; border-radius:8px; font-weight:bold;
            ">
                @ Instagram
            </button>
        </div>

        <p id="login-divider" style="color:rgba(255,255,255,0.3); font-size:12px; margin:8px 0;">ou digite seu nome</p>

        <input id="nome" placeholder="Seu nome (mín. 3 letras)"
            style="padding:10px; font-size:16px; border-radius:6px; border:none; text-align:center; width:250px; max-width:90%;">
        <br><br>
        <button id="save" disabled style="
            padding:12px 24px; font-size:16px; border:none; cursor:pointer;
            background:gray; color:white; border-radius:6px;">
            Salvar Recorde
        </button>
        <br><br>
        <button id="continue" style="
            display:none; padding:12px 24px; font-size:16px; border:none;
            cursor:pointer; background:green; color:white; border-radius:6px; margin-bottom:20px;">
            Continuar
        </button>
        <div id="ranking" style="width:100%; max-width:400px;"></div>
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

    // --- Login com Google ---
    document.getElementById('google-login').addEventListener('click', async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await firebase.auth().signInWithPopup(provider);
            const nome = result.user.displayName || result.user.email;
            if (nome) {
                input.value = nome;
                input.dispatchEvent(new Event('input'));
                document.getElementById('login-options').style.display = 'none';
                document.getElementById('login-divider').style.display = 'none';
            }
        } catch (err) {
            console.warn('Login Google cancelado ou falhou:', err);
        }
    });

    // --- Login com Instagram (via Facebook/Meta Auth) ---
    document.getElementById('ig-login').addEventListener('click', async () => {
        try {
            const provider = new firebase.auth.FacebookAuthProvider();
            provider.addScope('email');
            const result = await firebase.auth().signInWithPopup(provider);
            const nome = result.user.displayName || result.user.email;
            if (nome) {
                input.value = nome;
                input.dispatchEvent(new Event('input'));
                document.getElementById('login-options').style.display = 'none';
                document.getElementById('login-divider').style.display = 'none';
            }
        } catch (err) {
            console.warn('Login Instagram/Meta cancelado ou falhou:', err);
        }
    });

    save.onclick = () => {
        nomeJogador = input.value.trim();
        localStorage.setItem('longeDeCasa_nomeJogador', nomeJogador);
        salvar(nomeJogador, tempoFinal);
        save.style.display = 'none';
        input.style.display = 'none';
        const opts = document.getElementById('login-options');
        if (opts) opts.style.display = 'none';
        const div = document.getElementById('login-divider');
        if (div) div.style.display = 'none';
        cont.style.display = 'block';
    };

    cont.onclick = () => {
        screen.remove();
        mostrarPresave();
    };

    mostrarRanking(nomeJogador);
}

// ===============================
// TELA DE PRESAVE
// ===============================
function mostrarPresave() {
    const modal = document.getElementById('congrats-modal');
    modal.innerHTML = '';
    modal.style.display = 'flex';

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.innerHTML = `
        <h2>Parabéns! Você encontrou todos os objetos!</h2>
        <a href="https://sym.ffm.to/longedecasa_" target="_blank" class="pre-save-btn">
            Presave da música
        </a>
        <br><br>
        <a id="voltar-pos-jogo" href="#" style="
            color:rgba(255,255,255,0.6); text-decoration:none; font-size:14px;
        ">&larr; Voltar</a>
    `;
    modal.appendChild(content);

    document.getElementById('voltar-pos-jogo').addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'none';
        if (typeof mostrarBloqueio === 'function') mostrarBloqueio();
    });
}

// ===============================
// SALVAR RESULTADO
// ===============================
async function salvar(nome, tempoFinal) {
    // localStorage como fallback
    let r = JSON.parse(localStorage.getItem('ranking')) || [];
    r.push({ nome, tempo: tempoFinal });
    r.sort((a, b) => a.tempo - b.tempo);
    r = r.slice(0, 50);
    localStorage.setItem('ranking', JSON.stringify(r));

    // Firebase
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

    localStorage.removeItem('longeDeCasa_tempoAcumulado');
    localStorage.removeItem('longeDeCasa_tempoFinal');

    mostrarRanking(nome);
}

// ===============================
// RANKING (TOP 50 com highlight)
// ===============================
async function mostrarRanking(nomeJogador) {
    const div = document.getElementById('ranking');
    if (!div) return;

    if (!nomeJogador) {
        nomeJogador = localStorage.getItem('longeDeCasa_nomeJogador') || '';
    }

    let dados = [];

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

    let jogadorIndex = -1;
    if (nomeJogador) {
        jogadorIndex = dados.findIndex(p => p.nome === nomeJogador);
    }

    const highlightStyle = 'background:rgba(0,200,0,0.15); font-weight:bold;';

    function criarLinha(p, i, isHighlight) {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #222';
        if (isHighlight) tr.style.cssText += highlightStyle;

        let medal = '';
        if (i === 0) medal = ' &#129351;';
        else if (i === 1) medal = ' &#129352;';
        else if (i === 2) medal = ' &#129353;';

        tr.innerHTML = `
            <td style="padding:6px;">${i + 1}${medal}</td>
            <td style="padding:6px;">${p.nome}${isHighlight ? ' &#9733;' : ''}</td>
            <td style="padding:6px; text-align:right;">${formatTime(p.tempo)}</td>
        `;
        return tr;
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

    // Jogador no topo se não é #1
    if (jogadorIndex > 0) {
        tbody.appendChild(criarLinha(dados[jogadorIndex], jogadorIndex, true));
        const sep = document.createElement('tr');
        sep.innerHTML = '<td colspan="3" style="padding:2px 0; border-bottom:2px solid #444;"></td>';
        tbody.appendChild(sep);
    }

    dados.forEach((p, i) => {
        tbody.appendChild(criarLinha(p, i, i === jogadorIndex));
    });

    table.appendChild(tbody);
    div.appendChild(table);
}

// ===============================
// VERIFICAR RETOMADA DE JOGO
// ===============================
if (typeof retomarJogo === 'function') {
    retomarJogo(iniciarTimer);
}
