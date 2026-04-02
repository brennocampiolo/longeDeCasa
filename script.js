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

let foundCount = 0;
const totalObjects = hotspots.length;
// Exposto no window para o modo debug poder desabilitar
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
// Se já jogou, vai direto para pós-jogo sem precisar clicar
// Usa setTimeout(0) para garantir que timer.js carregou (mostrarRanking)
if (jaJogou()) {
    setTimeout(() => mostrarBloqueio(), 0);
}

startButton.addEventListener('click', () => {
    if (jaJogou()) {
        mostrarBloqueio();
        return;
    }
    startScreen.style.display = 'none';
    previewScreen.style.display = 'flex';
});

advanceButton.addEventListener('click', () => {
    previewScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    iniciarPanzoom();
    iniciarMusica();
});

backButton.addEventListener('click', () => {
    location.reload();
});

// ===============================
// TELA DE BLOQUEIO
// ===============================
let bloqueioAtivo = false;
function mostrarBloqueio() {
    // Evita duplicação se chamado mais de uma vez (ex: voltar do presave)
    if (bloqueioAtivo) {
        // Apenas scroll para o topo e atualiza ranking
        window.scrollTo(0, 0);
        if (typeof mostrarRanking === 'function') mostrarRanking();
        return;
    }
    bloqueioAtivo = true;

    startScreen.style.display = 'none';
    document.body.style.overflow = 'visible';
    document.body.style.overflowX = 'hidden';

    // === Pre-save bar (fixed top, sempre visível) ===
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

    // Esconde indicador quando ranking fica visível
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            indicator.style.opacity = entry.isIntersecting ? '0' : '1';
            indicator.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
        });
    }, { threshold: 0.1 });
    observer.observe(rankingSection);

    // Carrega ranking
    if (typeof mostrarRanking === 'function') mostrarRanking();
}

// ===============================
// PANZOOM (ZOOM + DRAG)
// ===============================
function iniciarPanzoom() {
    const img = gameImage;

    function setupAfterLoad() {
        // Dimensiona o wrapper para o tamanho real da imagem renderizada
        const imgRect = img.getBoundingClientRect();
        const wrapperW = imgRect.width;
        const wrapperH = imgRect.height;

        gameWrapper.style.width = wrapperW + 'px';
        gameWrapper.style.height = wrapperH + 'px';
        gameWrapper.style.position = 'absolute';
        gameWrapper.style.left = '0';
        gameWrapper.style.top = '0';

        // Imagem preenche o wrapper
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.left = '0';
        img.style.top = '0';
        img.style.transform = 'none';
        img.style.position = 'absolute';

        // Coordenadas dos hotspots já são relativas à imagem (calibradas via modo debug)
        // Calcula offset para centralizar
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

        // Zoom com scroll do mouse
        gameContainer.addEventListener('wheel', function(e) {
            e.preventDefault();
            window.panzoomInstance.zoomWithWheel(e);
        }, { passive: false });

        // Previne scroll padrão do browser no mobile para liberar drag vertical
        gameContainer.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });

        // Detecta drag vs click pela distância do ponteiro.
        // Listeners no container (não no wrapper) para não competir com panzoom.
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
    counter.textContent = `${foundCount} / ${totalObjects}`;
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
        counter.textContent = `${foundCount} / ${totalObjects}`;
        salvarEncontrados();

        if (foundCount === totalObjects) {
            finalizarJogo();
        }
    });
});

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
// Chamada por timer.js após carregar (para garantir que iniciarTimer existe)
function retomarJogo(onResume) {
    if (jaJogou()) return false;
    if (localStorage.getItem('longeDeCasa_jogoIniciado') !== 'true') return false;

    startScreen.style.display = 'none';
    previewScreen.style.display = 'none';
    gameContainer.style.display = 'block';

    restaurarEncontrados();
    iniciarPanzoom();

    // Overlay — timer só inicia quando o jogador clica
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
