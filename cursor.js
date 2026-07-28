/* ============================================================
   CURSOR PERSONALIZADO — img/cursor.png (spritesheet)
   ------------------------------------------------------------
   A imagem "img/cursor.png" contém DOIS cursores lado a lado:
     • metade ESQUERDA  -> cursor padrão (estado normal)
     • metade DIREITA   -> cursor de interação (hover sobre algo
                           clicável/selecionável)

   O que este script faz:
     1. Carrega a imagem uma única vez apenas para descobrir as
        dimensões reais do spritesheet (largura/altura em pixels).
        Isso garante que o cursor NUNCA fique distorcido, não
        importa o tamanho real do arquivo cursor.png.
     2. Redimensiona o sprite mantendo a proporção original,
        ajustando para um tamanho parecido com um cursor de
        sistema (ver CURSOR_HEIGHT abaixo).
     3. Move o elemento #custom-cursor junto com o mouse, em
        tempo real (sem atraso), usando requestAnimationFrame.
     4. Detecta quando o mouse está sobre um elemento clicável/
        selecionável e troca para a metade direita do sprite.
   ============================================================ */
(function () {
    'use strict';

    // Dispositivos de toque não têm cursor de mouse real:
    // não faz sentido (e pioraria a UX) ativar o cursor customizado neles.
    var isTouchDevice = window.matchMedia &&
        window.matchMedia('(hover: none), (pointer: coarse)').matches;

    if (isTouchDevice) return;

    var cursorEl = document.getElementById('custom-cursor');
    if (!cursorEl) return;

    /* =========================================================
       CONFIGURAÇÕES AJUSTÁVEIS
       ========================================================= */
    // Altura final do cursor na tela, em pixels. A largura é
    // calculada automaticamente para manter a proporção original.
    var CURSOR_HEIGHT = 30;

    // Posição do "ponto de clique" (hotspot) dentro do sprite,
    // em proporção (0 a 1) da largura/altura de UM cursor.
    // 0,0 = ponta do cursor exatamente no canto superior esquerdo
    // do sprite (padrão de um ponteiro comum estilo seta).
    // Se a ponta do seu desenho estiver em outro lugar da imagem,
    // ajuste estes dois valores.
    // (cursor.png recortado: a ponta da seta fica bem perto do canto,
    // por isso o valor é pequeno em vez de 0 exato)
    var HOTSPOT_X_RATIO = 0.034;
    var HOTSPOT_Y_RATIO = 0.034;

    var SPRITE_URL = 'img/cursor.png';

    /* =========================================================
       Estado interno
       ========================================================= */
    var displayWidth = 0;   // largura exibida de UM cursor (px), calculada
    var displayHeight = CURSOR_HEIGHT;
    var ready = false;      // true assim que a imagem carregar e as medidas forem calculadas
    var isInteractive = false;

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;

    /* =========================================================
       1) Descobre as dimensões reais do spritesheet
       ========================================================= */
    var sizingImage = new Image();
    sizingImage.onload = function () {
        var frameWidth = sizingImage.naturalWidth / 2;   // largura de 1 cursor (metade da imagem)
        var frameHeight = sizingImage.naturalHeight;      // altura real da imagem
        var scale = displayHeight / frameHeight;

        displayWidth = frameWidth * scale;

        // Define o tamanho do elemento e o "zoom" do sprite,
        // preservando exatamente a proporção original de cada metade.
        cursorEl.style.width = displayWidth + 'px';
        cursorEl.style.height = displayHeight + 'px';
        cursorEl.style.backgroundImage = 'url("' + SPRITE_URL + '")';
        cursorEl.style.backgroundSize = (displayWidth * 2) + 'px ' + displayHeight + 'px';

        ready = true;
        applySpriteState();
        cursorEl.style.opacity = '1';
    };
    sizingImage.onerror = function () {
        // Se a imagem não existir/carregar, mantemos o cursor nativo
        // do navegador em vez de deixar a tela sem nenhum cursor.
        console.warn('[cursor.js] Não foi possível carregar "' + SPRITE_URL + '". O cursor customizado não será exibido.');
        document.documentElement.classList.add('cursor-fallback-native');
    };
    sizingImage.src = SPRITE_URL;

    /* =========================================================
       2) Troca entre metade esquerda (normal) e direita (hover)
       ========================================================= */
    function applySpriteState() {
        if (!ready) return;
        // Estado normal -> mostra o início da imagem (0px)
        // Estado interativo -> desloca o fundo para a esquerda
        // exatamente pela largura de 1 cursor, revelando a metade direita.
        var offsetX = isInteractive ? -displayWidth : 0;
        cursorEl.style.backgroundPosition = offsetX + 'px 0px';
    }

    /* =========================================================
       3) Acompanha o mouse em tempo real (via rAF, sem travar a UI)
       ========================================================= */
    function renderCursorPosition() {
        var hotspotX = displayWidth * HOTSPOT_X_RATIO;
        var hotspotY = displayHeight * HOTSPOT_Y_RATIO;
        cursorEl.style.transform =
            'translate(' + (mouseX - hotspotX) + 'px, ' + (mouseY - hotspotY) + 'px)';
        requestAnimationFrame(renderCursorPosition);
    }
    requestAnimationFrame(renderCursorPosition);

    window.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    // Esconde o cursor customizado quando o mouse sai da janela do
    // navegador e mostra novamente quando ele volta.
    document.addEventListener('mouseleave', function () {
        cursorEl.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
        if (ready) cursorEl.style.opacity = '1';
    });

    /* =========================================================
       4) Detecta elementos clicáveis/selecionáveis
       ========================================================= */
    // Cobre: links, botões, campos de formulário, qualquer elemento
    // com onclick/role="button", e qualquer elemento com a classe
    // utilitária ".cursor-pointer" (para casos personalizados).
    var INTERACTIVE_SELECTOR = [
        'a',
        'button',
        'input',
        'textarea',
        'select',
        'label',
        '[onclick]',
        '[role="button"]',
        '[tabindex]:not([tabindex="-1"])',
        '.btn',
        '.cursor-pointer'
    ].join(', ');

    document.addEventListener('mouseover', function (e) {
        var target = e.target && e.target.closest
            ? e.target.closest(INTERACTIVE_SELECTOR)
            : null;

        var next = !!target;
        if (next !== isInteractive) {
            isInteractive = next;
            applySpriteState();
        }
    }, { passive: true });
})();
