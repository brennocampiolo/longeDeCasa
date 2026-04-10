const { test, expect } = require('@playwright/test');
const path = require('path');

const SCREENSHOTS = path.join(__dirname, '..', 'screenshots');

// Helper: clica num hotspot
async function clickHotspot(hotspot) {
    await hotspot.click({ force: true });
}

// Helper: navega até o jogo e espera estar pronto
async function navegarAteJogo(page) {
    await page.locator('#start-button').click();
    await expect(page.locator('#intro-screen')).toBeVisible({ timeout: 5000 });

    await page.locator('#intro-advance').click();
    await expect(page.locator('#preview-screen')).toBeVisible({ timeout: 5000 });

    await page.locator('#advance-button').click();
    await expect(page.locator('#game-container')).toBeVisible({ timeout: 5000 });

    const overlay = page.locator('#start-overlay');
    await expect(overlay).toBeVisible({ timeout: 10000 });
    // Espera o botão Iniciar aparecer (fica oculto até a imagem carregar)
    const iniciarBtn = overlay.locator('button');
    await expect(iniciarBtn).toBeVisible({ timeout: 30000 });
    await iniciarBtn.click();
    await expect(overlay).toBeHidden({ timeout: 5000 });

    // Espera a imagem carregar e o wrapper ser dimensionado
    await page.waitForFunction(() => {
        const img = document.getElementById('game-image');
        const wrapper = document.getElementById('game-wrapper');
        return img && img.complete && img.naturalHeight > 0
            && wrapper && wrapper.style.width && wrapper.style.width !== '';
    }, { timeout: 30000 });

    await page.waitForTimeout(500);
}

test.describe('Longe de Casa - Jogo', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#start-screen', { state: 'visible', timeout: 10000 });
    });

    test('01 - Tela inicial carrega corretamente', async ({ page }) => {
        await expect(page.locator('#start-screen')).toBeVisible();
        await expect(page.locator('.start-box .main-title')).toBeVisible();
        await expect(page.locator('#start-button')).toBeVisible();
        await page.screenshot({ path: `${SCREENSHOTS}/01-tela-inicial.png`, fullPage: true });
    });

    test('02 - Preview dos objetos aparece ao clicar Começar', async ({ page }) => {
        await page.locator('#start-button').click();
        await expect(page.locator('#intro-screen')).toBeVisible({ timeout: 5000 });
        await page.locator('#intro-advance').click();
        await expect(page.locator('#preview-screen')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('.object-item')).toHaveCount(7);
        await page.screenshot({ path: `${SCREENSHOTS}/02-preview-objetos.png`, fullPage: true });
    });

    test('03 - Imagem do jogo carrega e é visível', async ({ page }) => {
        await navegarAteJogo(page);

        const gameImage = page.locator('#game-image');
        await expect(gameImage).toBeVisible();

        const imgBox = await gameImage.boundingBox();
        expect(imgBox).not.toBeNull();
        expect(imgBox.width).toBeGreaterThan(100);
        expect(imgBox.height).toBeGreaterThan(100);

        await page.screenshot({ path: `${SCREENSHOTS}/03-jogo-imagem.png`, fullPage: true });
    });

    test('04 - Imagem ocupa toda a altura do viewport', async ({ page }) => {
        await navegarAteJogo(page);

        const imgBox = await page.locator('#game-image').boundingBox();
        const viewport = page.viewportSize();

        expect(imgBox.height).toBeGreaterThan(viewport.height * 0.9);

        await page.screenshot({ path: `${SCREENSHOTS}/04-imagem-viewport.png`, fullPage: true });
    });

    test('05 - Hotspots são clicáveis', async ({ page }) => {
        await navegarAteJogo(page);

        const hotspots = page.locator('.hotspot');
        await expect(hotspots).toHaveCount(7);

        const imgBox = await page.locator('#game-image').boundingBox();
        console.log('Image box:', JSON.stringify(imgBox));

        for (let i = 0; i < 7; i++) {
            const box = await hotspots.nth(i).boundingBox();
            const dataId = await hotspots.nth(i).getAttribute('data-id');
            console.log(`Hotspot ${dataId}:`, JSON.stringify(box));
        }

        await page.screenshot({ path: `${SCREENSHOTS}/05-hotspots-posicoes.png`, fullPage: true });

        // Simula pointerup (como touchpad faz)
        await clickHotspot(hotspots.nth(0));
        await expect(hotspots.nth(0)).toHaveClass(/found/);
        await expect(page.locator('#counter')).toContainText('1 / 7');

        await page.screenshot({ path: `${SCREENSHOTS}/06-primeiro-hotspot-clicado.png`, fullPage: true });
    });

    test('06 - Jogo completo: clicar todos os 7 hotspots', async ({ page }) => {
        await navegarAteJogo(page);

        const hotspots = page.locator('.hotspot');

        for (let i = 0; i < 7; i++) {
            await clickHotspot(hotspots.nth(i));
            const dataId = await hotspots.nth(i).getAttribute('data-id');
            console.log(`Clicou hotspot ${dataId} - contador: ${i + 1}/7`);
        }

        await expect(page.locator('#counter')).toContainText('7 / 7');

        const scoreScreen = page.locator('#score-screen');
        await expect(scoreScreen).toBeVisible({ timeout: 5000 });
        await page.screenshot({ path: `${SCREENSHOTS}/07-tela-score.png`, fullPage: true });

        await page.locator('#nome').fill('TestPlayer');
        await page.locator('#save').click();
        await page.screenshot({ path: `${SCREENSHOTS}/08-score-salvo.png`, fullPage: true });

        await page.locator('#continue').click();
        await expect(page.locator('#congrats-modal')).toBeVisible({ timeout: 5000 });
        await page.screenshot({ path: `${SCREENSHOTS}/09-parabens.png`, fullPage: true });
    });

    test('07 - Pós-jogo carrega direto sem clicar', async ({ page }) => {
        await page.evaluate(() => {
            localStorage.setItem('longeDeCasa_jogou', 'true');
        });
        await page.reload({ waitUntil: 'domcontentloaded' });

        // Deve ir direto para pós-jogo sem precisar clicar em nada
        await expect(page.locator('#start-screen')).toBeHidden({ timeout: 10000 });
        await expect(page.locator('#game-container')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#ranking-section')).toBeAttached({ timeout: 5000 });
        await page.screenshot({ path: `${SCREENSHOTS}/10-pos-jogo-direto.png`, fullPage: true });
    });

    test('07c - Retorno sem nome salvo mostra score screen', async ({ page }) => {
        // Simula: jogou, finalizou, mas saiu sem salvar nome
        await page.evaluate(() => {
            localStorage.setItem('longeDeCasa_jogou', 'true');
            localStorage.setItem('longeDeCasa_tempoFinal', '95');
        });
        await page.reload({ waitUntil: 'domcontentloaded' });

        // Deve mostrar score screen com campo de nome
        const scoreScreen = page.locator('#score-screen');
        await expect(scoreScreen).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#nome')).toBeVisible({ timeout: 5000 });

        // Salva nome
        await page.locator('#nome').fill('RetornoTest');
        await page.locator('#save').click();

        // Botão continuar aparece
        await expect(page.locator('#continue')).toBeVisible({ timeout: 5000 });
        await page.screenshot({ path: `${SCREENSHOTS}/10c-retorno-sem-nome.png`, fullPage: true });
    });

    test('07b - Score screen com ranking grande é scrollável', async ({ page }) => {
        // Injeta ranking fake grande no localStorage
        const fakeRanking = Array.from({ length: 50 }, (_, i) => ({
            nome: `Jogador${i + 1}`,
            tempo: 60 + i
        }));
        await page.evaluate((r) => {
            localStorage.setItem('ranking', JSON.stringify(r));
        }, fakeRanking);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#start-screen', { state: 'visible', timeout: 10000 });

        await navegarAteJogo(page);

        // Encontra todos os hotspots para chegar na score screen
        const hotspots = page.locator('.hotspot');
        for (let i = 0; i < 7; i++) {
            await clickHotspot(hotspots.nth(i));
        }

        // Score screen aparece
        const scoreScreen = page.locator('#score-screen');
        await expect(scoreScreen).toBeVisible({ timeout: 5000 });

        // Preenche nome e salva para mostrar botão Continuar
        await page.locator('#nome').fill('TestScroll');
        await page.locator('#save').click();

        // Botão Continuar deve existir
        const continueBtn = page.locator('#continue');
        await expect(continueBtn).toBeAttached({ timeout: 5000 });

        // Scroll até o botão Continuar (simula mobile com ranking grande)
        await continueBtn.scrollIntoViewIfNeeded();
        await expect(continueBtn).toBeVisible({ timeout: 5000 });
        await page.screenshot({ path: `${SCREENSHOTS}/10b-score-scroll.png`, fullPage: true });
    });

    test('08 - Botão de música existe e responde ao clique', async ({ page }) => {
        await navegarAteJogo(page);

        const musicBtn = page.locator('#music-toggle');
        await expect(musicBtn).toBeVisible();

        const textBefore = await musicBtn.innerText();
        await musicBtn.click();
        const textAfter = await musicBtn.innerText();
        expect(textAfter).not.toBe(textBefore);

        await page.screenshot({ path: `${SCREENSHOTS}/11-musica-toggle.png`, fullPage: true });
    });

    test('09 - Drag não dispara hotspot (distingue drag de click)', async ({ page }) => {
        await navegarAteJogo(page);

        const hotspot = page.locator('.hotspot').nth(0);
        const box = await hotspot.boundingBox();

        // Simula drag: pointerdown → move 50px → pointerup
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50, { steps: 5 });
        await page.mouse.up();

        await page.waitForTimeout(100);

        // Hotspot NÃO deve ter classe "found" após drag
        const hasFound = await hotspot.evaluate(el => el.classList.contains('found'));
        expect(hasFound).toBe(false);

        await page.screenshot({ path: `${SCREENSHOTS}/12-drag-nao-clica.png`, fullPage: true });
    });

    test('10 - Zoom funciona com scroll do mouse', async ({ page }) => {
        await navegarAteJogo(page);

        const wrapperBefore = await page.locator('#game-wrapper').boundingBox();
        await page.screenshot({ path: `${SCREENSHOTS}/13-antes-zoom.png`, fullPage: true });

        // Simula zoom in com scroll
        await page.mouse.move(640, 360);
        await page.mouse.wheel(0, -300);
        await page.waitForTimeout(500);

        await page.screenshot({ path: `${SCREENSHOTS}/14-depois-zoom.png`, fullPage: true });

        // Verifica que o transform mudou (zoom aplicado)
        const transform = await page.locator('#game-wrapper').evaluate(
            el => window.getComputedStyle(el).transform
        );
        console.log('Transform após zoom:', transform);
        expect(transform).not.toBe('none');
    });
});
