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

// Elementos adicionados pelo cliente
const introScreen = document.getElementById('intro-screen');
const introBack = document.getElementById('intro-back');
const introAdvance = document.getElementById('intro-advance');
const previewBack = document.getElementById('preview-back');

let foundCount = 0;
const totalObjects = hotspots.length;
window.panzoomInstance = null;
let isDragging = false;

// ===============================
// DADOS DOS OBJETOS
// ===============================
const objetos = [
    { id: '1', nome: 'Shampoo', img: 'assets/objeto1.png' },
    { id: '2', nome: 'Espelho', img: 'assets/objeto2.png' },
    { id: '3', nome: 'Microfone', img: 'assets/objeto3.png' },
    { id: '4', nome: 'Luva', img: 'assets/objeto4.png' },
    { id: '5', nome: 'Fone', img: 'assets/objeto5.png' },
    { id: '6', nome: 'Mãe orando', img: 'assets/objeto6.png' },
    { id: '7', nome: 'Passaporte', img: 'assets/objeto7.png' },
];

function atualizarContador() {
    counter.innerHTML = `${foundCount} / ${totalObjects} <span style="font-size:1em; opacity:0.6; margin-left:6px; vertical-align:middle;">☰</span>`;
}

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

// Intro navegação
introBack.addEventListener('click', () => {
    introScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});

introAdvance.addEventListener('click', () => {
    introScreen.style.display = 'none';
    previewScreen.style.display = 'flex';
});

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

// ===============================
// TELA DE BLOQUEIO (POS-JOGO)
// ===============================
let bloqueioAtivo = false;
function mostrarBloqueio() {
    if (bloqueioAtivo) {
        window.scrollTo(0, 0);
        if (typeof mostrarRanking === 'function') mostrarRanking();
        return;
    }
    bloqueioAtivo = true;

    startScreen.style.display = 'none';
    introScreen.style.display = 'none';
    document.body.style.overflow = 'visible';
    document.body.style.overflowX = 'hidden';

    // === Pre-save bar (fixed top) ===
    const presaveBar = document.createElement('div');
    presaveBar.style.cssText = `
        position:fixed; top:0; left:0; width:100%;
        background:rgba(0,0,0,0.9); padding:12px 0;
        text-align:center; z-index:200;
        border-bottom:1px solid rgba(255,255,255,0.15);
    `;
    presaveBar.innerHTML = `
        <a href="https://sym.ffm.to/longedecasa_" target="_blank" style="
            color:white; text-decoration:none; background:green;
            padding:8px 24px; border-radius:6px; font-size:14px; font-weight:bold;
            display:inline-block;
        ">Presave da música</a>
    `;
    document.body.appendChild(presaveBar);

    // === Imagem interativa ===
    gameContainer.style.display = 'block';
    document.getElementById('back-button').style.display = 'none';
    counter.style.display = 'none';
    musicToggle.style.display = 'none';
    hotspots.forEach(h => h.style.display = 'none');
    iniciarPanzoom();

    // === Ranking section abaixo da imagem ===
    const rankingSection = document.createElement('div');
    rankingSection.id = 'ranking-section';
    rankingSection.style.cssText = `
        min-height:80vh; background:black; color:white;
        display:flex; flex-direction:column; align-items:center;
        padding:40px 20px; box-sizing:border-box;
    `;
    rankingSection.innerHTML = '<div id="ranking" style="width:100%; max-width:400px;"></div>';
    gameContainer.after(rankingSection);

    // === Indicador "Ranking ↓" (fixed bottom-right) ===
    const indicator = document.createElement('div');
    indicator.id = 'ranking-indicator';
    indicator.style.cssText = `
        position:fixed; bottom:20px; right:20px;
        background:rgba(0,0,0,0.75); color:white;
        padding:12px 18px; border-radius:12px;
        text-align:center; z-index:100;
        border:1px solid rgba(255,255,255,0.2);
        cursor:pointer; transition:opacity 0.3s;
        backdrop-filter:blur(4px);
    `;
    indicator.innerHTML = `
        <div style="font-size:14px; font-weight:bold; letter-spacing:1px;">Ranking</div>
        <div style="font-size:22px; margin-top:2px; animation:indicatorBounce 1.5s infinite;">&#8595;</div>
    `;
    const bounceStyle = document.createElement('style');
    bounceStyle.textContent = `
        @keyframes indicatorBounce {
            0%,100% { transform:translateY(0); }
            50% { transform:translateY(6px); }
        }
    `;
    document.head.appendChild(bounceStyle);

    indicator.addEventListener('click', () => {
        rankingSection.scrollIntoView({ behavior: 'smooth' });
    });
    document.body.appendChild(indicator);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            indicator.style.opacity = entry.isIntersecting ? '0' : '1';
            indicator.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
        });
    }, { threshold: 0.1 });
    observer.observe(rankingSection);

    if (typeof mostrarRanking === 'function') mostrarRanking();
}

// ===============================
// PANZOOM (ZOOM + DRAG)
// ===============================
function iniciarPanzoom() {
    const img = gameImage;

    function setupAfterLoad() {
        const imgRect = img.getBoundingClientRect();
        const wrapperW = imgRect.width;
        const wrapperH = imgRect.height;

        gameWrapper.style.width = wrapperW + 'px';
        gameWrapper.style.height = wrapperH + 'px';
        gameWrapper.style.position = 'absolute';
        gameWrapper.style.left = '0';
        gameWrapper.style.top = '0';

        img.style.width = '100%';
        img.style.height = '100%';
        img.style.left = '0';
        img.style.top = '0';
        img.style.transform = 'none';
        img.style.position = 'absolute';

        const containerW = gameContainer.clientWidth;
        const containerH = gameContainer.clientHeight;
        const panStartX = (containerW - wrapperW) / 2;
        const panStartY = (containerH - wrapperH) / 2;

        window.panzoomInstance = Panzoom(gameWrapper, {
            maxScale: 5,
            minScale: 1,
            contain: 'outside',
            cursor: 'grab',
            startX: panStartX,
            startY: panStartY
        });

        gameContainer.addEventListener('wheel', function(e) {
            e.preventDefault();
            window.panzoomInstance.zoomWithWheel(e);
        }, { passive: false });

        gameContainer.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });

        let pointerStartX, pointerStartY;

        gameContainer.addEventListener('pointerdown', (e) => {
            pointerStartX = e.clientX;
            pointerStartY = e.clientY;
            isDragging = false;
        }, true);

        gameContainer.addEventListener('pointerup', (e) => {
            if (pointerStartX !== undefined) {
                const dx = Math.abs(e.clientX - pointerStartX);
                const dy = Math.abs(e.clientY - pointerStartY);
                isDragging = (dx > 5 || dy > 5);
            }
            pointerStartX = undefined;
            pointerStartY = undefined;
        }, true);
    }

    if (img.complete && img.naturalHeight > 0) {
        setupAfterLoad();
    } else {
        img.addEventListener('load', setupAfterLoad);
    }
}

// ===============================
// PERSISTENCIA DE HOTSPOTS ENCONTRADOS
// ===============================
function salvarEncontrados() {
    const ids = [];
    hotspots.forEach(h => {
        if (h.classList.contains('found')) ids.push(h.getAttribute('data-id'));
    });
    localStorage.setItem('longeDeCasa_encontrados', JSON.stringify(ids));
}

function restaurarEncontrados() {
    const ids = JSON.parse(localStorage.getItem('longeDeCasa_encontrados') || '[]');
    ids.forEach(id => {
        const h = document.querySelector(`.hotspot[data-id="${id}"]`);
        if (h && !h.classList.contains('found')) {
            h.classList.add('found');
            foundCount++;
        }
    });
    atualizarContador();
}

// ===============================
// HOTSPOTS (CLIQUE)
// ===============================
hotspots.forEach(hotspot => {
    hotspot.addEventListener('click', function (e) {
        if (isDragging) return;
        if (this.classList.contains('found')) return;

        this.classList.add('found');
        foundCount++;
        atualizarContador();
        salvarEncontrados();

        if (foundCount === totalObjects) {
            finalizarJogo();
        }
    });
});

// ===============================
// POPUP DE ITENS (no contador)
// ===============================
atualizarContador();

counter.addEventListener('click', () => {
    const existing = document.getElementById('items-popup-overlay');
    if (existing) { existing.remove(); return; }
    mostrarPopupItens();
});

function mostrarPopupItens() {
    const overlay = document.createElement('div');
    overlay.id = 'items-popup-overlay';
    overlay.style.cssText = `
        position:fixed; top:0; left:0; width:100%; height:100%;
        background:rgba(0,0,0,0.6); z-index:500;
        display:flex; justify-content:center; align-items:center;
        backdrop-filter:blur(3px);
        animation:popupFadeIn 0.2s ease;
    `;

    const popup = document.createElement('div');
    popup.style.cssText = `
        background:rgba(20,20,20,0.95); border-radius:16px;
        padding:20px; max-width:320px; width:90%;
        border:1px solid rgba(255,255,255,0.1);
        box-shadow:0 8px 32px rgba(0,0,0,0.5);
    `;

    let html = `
        <div style="text-align:center; margin-bottom:14px;">
            <span style="color:white; font-size:15px; font-weight:bold; letter-spacing:1px;">
                Itens — ${foundCount} / ${totalObjects}
            </span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
    `;

    objetos.forEach(obj => {
        const hotspot = document.querySelector(`.hotspot[data-id="${obj.id}"]`);
        const found = hotspot && hotspot.classList.contains('found');
        html += `
            <div style="position:relative; text-align:center; padding:10px 6px;
                border-radius:10px; background:rgba(255,255,255,${found ? '0.03' : '0.06'});">
                <div style="position:relative; display:inline-block;">
                    <img src="${obj.img}" style="width:55px; height:55px; border-radius:8px;
                        object-fit:cover; ${found ? 'opacity:0.3;' : ''}">
                    ${found ? `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);">
                        <img src="assets/check.png" style="width:28px; height:28px;" onerror="this.outerHTML='<span style=\\'font-size:28px; color:#00cc00;\\'>✓</span>'">
                    </div>` : ''}
                </div>
                <div style="color:white; font-size:11px; margin-top:6px;
                    opacity:${found ? '0.3' : '0.8'}; ${found ? 'text-decoration:line-through;' : ''}">
                    ${obj.nome}
                </div>
            </div>
        `;
    });

    html += '</div>';
    popup.innerHTML = html;
    overlay.appendChild(popup);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    // Injeta animação se ainda não existe
    if (!document.getElementById('popup-anim-style')) {
        const s = document.createElement('style');
        s.id = 'popup-anim-style';
        s.textContent = '@keyframes popupFadeIn { from { opacity:0; } to { opacity:1; } }';
        document.head.appendChild(s);
    }

    document.body.appendChild(overlay);
}

// ===============================
// MUSICA DE FUNDO
// ===============================
let musicPlaying = false;

function iniciarMusica() {
    bgMusic.volume = 0.3;
    bgMusic.play().then(() => {
        musicPlaying = true;
        musicToggle.innerHTML = '&#9835; ON';
    }).catch(() => {
        musicPlaying = false;
        musicToggle.innerHTML = '&#9835; OFF';
    });
}

musicToggle.addEventListener('click', () => {
    if (musicPlaying) {
        bgMusic.pause();
        musicPlaying = false;
        musicToggle.innerHTML = '&#9835; OFF';
    } else {
        bgMusic.play();
        musicPlaying = true;
        musicToggle.innerHTML = '&#9835; ON';
    }
});

// ===============================
// RETOMADA DE JOGO EM ANDAMENTO
// ===============================
function retomarJogo(onResume) {
    if (jaJogou()) return false;
    if (localStorage.getItem('longeDeCasa_jogoIniciado') !== 'true') return false;

    startScreen.style.display = 'none';
    introScreen.style.display = 'none';
    previewScreen.style.display = 'none';
    gameContainer.style.display = 'block';

    restaurarEncontrados();
    iniciarPanzoom();

    const resumeOverlay = document.createElement('div');
    resumeOverlay.style.cssText = `
        position:fixed; top:0; left:0;
        width:100%; height:100%;
        background:rgba(0,0,0,0.85);
        display:flex; justify-content:center; align-items:center;
        z-index:3000;
    `;
    const resumeBtn = document.createElement('button');
    resumeBtn.innerText = 'Continuar Jogo';
    resumeBtn.style.cssText = `
        padding:20px 50px; font-size:22px;
        background:green; color:white;
        border:none; border-radius:12px; cursor:pointer;
    `;
    resumeBtn.addEventListener('mouseenter', () => resumeBtn.style.background = '#00cc00');
    resumeBtn.addEventListener('mouseleave', () => resumeBtn.style.background = 'green');
    resumeOverlay.appendChild(resumeBtn);
    document.body.appendChild(resumeOverlay);

    resumeBtn.addEventListener('click', () => {
        resumeOverlay.remove();
        iniciarMusica();
        if (onResume) onResume();
    });

    return true;
}
