/**
 * Testimonials Slider - Seção de depoimentos com slider responsivo
 * Exibe depoimentos em cards deslizantes com foto, nome e cargo do autor
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.TestimonialsSliderConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        active: true,

        // Onde inserir a seção de depoimentos na página
        insertSelector: 'body',
        insertMethod: 'beforeend', // 'beforeend' | 'afterbegin' | 'beforebegin' | 'afterend'

        // Título da seção
        showTitle: true,
        title: 'O QUE NOSSOS CLIENTES DIZEM',
        subtitle: '', // Subtítulo opcional abaixo do título principal

        // Array de depoimentos
        testimonials: [
            {
                quote: 'Na correria, muitas vezes acabo negligenciando a dieta. O produto me ajuda a repor o que preciso em um único ritual matinal. 2 scoops, água gelada e meu dia começa ancorando os demais hábitos da manhã.',
                author: 'Carlos Silva',
                role: 'Empresário',
                photo: '' // URL da foto (deixe vazio para usar as iniciais)
            },
            {
                quote: 'Já cheguei a ter 20 suplementos diferentes até entender: quando complica demais, você abandona. Isso resolve com simplicidade. Saúde é conseguir manter, não começar empolgado e parar no meio.',
                author: 'Ana Rocha',
                role: 'Médica Nutrologa',
                photo: ''
            },
            {
                quote: 'Meu foco é a performance integral, tanto mental quanto física. O produto se encaixou perfeitamente na minha rotina: prático, completo e eficaz. Hoje, ele é indispensável para mim.',
                author: 'Gustavo Duarte',
                role: 'Nutricionista Clínico',
                photo: ''
            },
            {
                quote: 'O produto se destaca pela biodisponibilidade e pela composição abrangente, perfeita para minhas necessidades. Senti mais constância de energia e foco ao longo do dia. Entregou exatamente o que eu buscava.',
                author: 'Bruna Cavallazzi',
                role: 'Nutricionista Esportiva',
                photo: ''
            },
            {
                quote: 'Mudei de cidade, multipliquei tarefas, corri várias maratonas. O produto me deu a base: energia, foco e recuperação. Me ajuda a dar conta do dia com mais força e leveza.',
                author: 'Rafa Arlotta',
                role: 'Embaixadora de Maratona',
                photo: ''
            },
            {
                quote: 'Meu benefício favorito é a clareza mental sem picos. Me sinto desperta de um jeito natural, sem energia excessiva. Para quem quer alinhar performance e bem-estar, vale demais.',
                author: 'Marcelo Toledo',
                role: 'Empresário e Palestrante',
                photo: ''
            }
        ],

        // Configurações do slider
        autoplay: true,
        autoplayDelay: 5000, // Intervalo em ms entre transições automáticas
        loop: true,          // Volta ao início ao chegar no final (e vice-versa)
        showArrows: true,    // Exibir botões anterior/próximo
        showDots: true,      // Exibir indicadores de posição

        // Quantidade de cards visíveis por breakpoint
        visibleCards: {
            desktop: 3,  // >= 1024px
            tablet: 2,   // >= 600px
            mobile: 1    // < 600px
        },

        // Espaço entre os cards (em px)
        cardGap: 24,

        // Número máximo de linhas no texto do depoimento antes do ellipsis
        // Pode ser um número único ou um objeto por breakpoint { desktop, tablet, mobile }
        // 0 = sem limite
        quoteMaxLines: {
            desktop: 0,
            tablet:  0,
            mobile:  0
        },

        // CORES E ESTILOS
        colors: {
            sectionBackground: '#f5f5f5',
            titleColor: '#111111',
            subtitleColor: '#666666',
            quoteBoxBackground: '#ece9e3',
            quoteBoxBorder: 'transparent',
            quoteBoxShadow: 'rgba(0, 0, 0, 0.04)',
            quoteMarkColor: '#aaaaaa',
            quoteTextColor: '#2a2a2a',
            photoBoxBackground: '#1a1a1a',
            photoBoxBorder: 'transparent',
            photoOverlayGradient: 'rgba(0,0,0,0.0), rgba(0,0,0,0.85)',
            authorNameColor: '#ffffff',
            authorRoleColor: 'rgba(255,255,255,0.72)',
            authorInitialsColor: '#555555',
            arrowBackground: '#ffffff',
            arrowBorder: '#e0e0e0',
            arrowIcon: '#333333',
            arrowHover: '#f0f0f0',
            dotActive: '#111111',
            dotInactive: '#cccccc',
            viewAllBackground: '#111111',
            viewAllTextColor: '#ffffff',
            viewAllBorder: 'transparent',
            viewAllHover: '#333333',
            productCardBackground: '#ffffff',
            productCardBorder: '#e0e0e0',
            productNameColor: '#111111',
            viewProductBackground: '#111111',
            viewProductTextColor: '#ffffff'
        },

        // Dimensões
        sectionPadding: '72px 20px',
        cardBorderRadius: '16px',
        photoAspectRatio: '3/4',

        // Classe CSS adicional na section (útil para customização externa)
        containerClass: '',

        // Limite de itens exibidos no slider (0 = sem limite, mostra todos)
        sliderLimit: 0,

        // Botão "Ver todos" exibido após a navegação do slider / lista
        showViewAll: false,
        viewAllText: 'Ver todos',
        viewAllUrl: '',
        viewAllTarget: '_self',

        // Modo de exibição: 'slider' | 'list'
        displayMode: 'slider',

        // Número de colunas no modo lista por breakpoint
        listColumns: {
            desktop: 3,
            tablet: 1,
            mobile: 1
        },

        // Texto do botão "ver produto" vinculado ao depoimento
        viewProductLabel: 'Ver produto',

        // URL base da loja (necessário para busca de produto por ID)
        // Ex: 'https://www.minhaloja.com.br'
        storeUrl: ''
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.TestimonialsSliderConfig && typeof window.TestimonialsSliderConfig === 'object') {
        Object.assign(CONFIG, window.TestimonialsSliderConfig);

        if (window.TestimonialsSliderConfig.colors && typeof window.TestimonialsSliderConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.TestimonialsSliderConfig.colors);
        }

        if (window.TestimonialsSliderConfig.visibleCards && typeof window.TestimonialsSliderConfig.visibleCards === 'object') {
            CONFIG.visibleCards = Object.assign({}, DEFAULT_CONFIG.visibleCards, window.TestimonialsSliderConfig.visibleCards);
        }

        if (window.TestimonialsSliderConfig.quoteMaxLines !== undefined) {
            const qml = window.TestimonialsSliderConfig.quoteMaxLines;
            if (typeof qml === 'number') {
                CONFIG.quoteMaxLines = { desktop: qml, tablet: qml, mobile: qml };
            } else if (typeof qml === 'object') {
                CONFIG.quoteMaxLines = Object.assign({}, DEFAULT_CONFIG.quoteMaxLines, qml);
            }
        }

        if (window.TestimonialsSliderConfig.listColumns && typeof window.TestimonialsSliderConfig.listColumns === 'object') {
            CONFIG.listColumns = Object.assign({}, DEFAULT_CONFIG.listColumns, window.TestimonialsSliderConfig.listColumns);
        }

        if (!window.TestimonialsSliderConfig.testimonials) {
            CONFIG.testimonials = DEFAULT_CONFIG.testimonials;
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    // ID único por instância — evita conflito quando o script é carregado mais de uma vez na página
    const _instanceId = (window.__tsInstanceCount = (window.__tsInstanceCount || 0) + 1);
    const SECTION_ID = 'testimonials-slider-section-' + _instanceId;
    const STYLES_ID  = 'testimonials-slider-styles-'  + _instanceId;

    const CSS_STYLES = `
        <style id="${STYLES_ID}">
            .ts-section {
                background: ${CONFIG.colors.sectionBackground};
                padding: ${CONFIG.sectionPadding};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                box-sizing: border-box;
            }

            .ts-section *,
            .ts-section *::before,
            .ts-section *::after {
                box-sizing: border-box;
            }

            .ts-inner {
                max-width: 1200px;
                margin: 0 auto;
            }

            /* ---- Cabeçalho ---- */
            .ts-header {
                text-align: center;
                margin-bottom: 48px;
            }

            .ts-title {
                font-size: clamp(1.3rem, 3vw, 2rem);
                font-weight: 800;
                color: ${CONFIG.colors.titleColor};
                letter-spacing: 0.04em;
                text-transform: uppercase;
                margin: 0 0 10px 0;
                line-height: 1.2;
            }

            .ts-subtitle {
                font-size: 1rem;
                color: ${CONFIG.colors.subtitleColor};
                margin: 0;
                line-height: 1.5;
            }

            /* ---- Viewport & Track ---- */
            .ts-viewport {
                overflow: hidden;
                position: relative;
                outline: none;
                cursor: grab;
                user-select: none;
                -webkit-user-select: none;
            }

            .ts-viewport.ts-dragging {
                cursor: grabbing;
            }

            .ts-viewport.ts-dragging .ts-photo-img {
                pointer-events: none;
            }

            .ts-track {
                display: flex;
                align-items: stretch;
                transition: transform 0.45s cubic-bezier(0.25, 0.1, 0.25, 1);
                will-change: transform;
            }

            .ts-track.ts-no-transition {
                transition: none !important;
            }

            /* ---- Card ---- */
            .ts-card {
                flex: 0 0 auto;
                padding: 0 ${CONFIG.cardGap / 2}px;
            }

            .ts-card-inner {
                display: flex;
                flex-direction: column;
                gap: 12px;
                height: 100%;
            }

            /* ---- Caixa de citação ---- */
            .ts-quote-box {
                background: ${CONFIG.colors.quoteBoxBackground};
                border: 1px solid ${CONFIG.colors.quoteBoxBorder};
                border-radius: ${CONFIG.cardBorderRadius};
                box-shadow: 0 2px 12px ${CONFIG.colors.quoteBoxShadow};
                padding: 40px 20px;
                display: flex;
                flex-direction: column;
                flex: 1;
                position:relative;
            }

            .ts-quote-open,
            .ts-quote-close {
                font-family: Georgia, 'Times New Roman', serif;
                font-size: 3.2rem;
                line-height: 0.75;
                color: ${CONFIG.colors.quoteMarkColor};
                user-select: none;
                display: block;
            }

            .ts-quote-open {
              position: absolute;
              top: 1rem;
              font-size: 10rem;
              opacity: .1;
              pointer-events: none;
              left: .5rem;
            }

            .ts-quote-close {
                position: absolute;
                top: 1rem;
                font-size: 10rem;
                opacity: .1;
                pointer-events: none;
                right: .5rem;
            }

            .ts-quote-text {
                font-size: 0.93rem;
                line-height: 1.75;
                color: ${CONFIG.colors.quoteTextColor};
                margin: 0;
                text-align: center;
                ${CONFIG.quoteMaxLines.desktop > 0 ? `
                display: -webkit-box;
                -webkit-line-clamp: ${CONFIG.quoteMaxLines.desktop};
                -webkit-box-orient: vertical;
                overflow: hidden;` : ''}
            }

            /* ---- Caixa de foto ---- */
            .ts-photo-box {
                position: relative;
                border-radius: ${CONFIG.cardBorderRadius};
                overflow: hidden;
                aspect-ratio: ${CONFIG.photoAspectRatio};
                background: ${CONFIG.colors.photoBoxBackground};
                flex-shrink: 0;
            }

            .ts-photo-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            .ts-photo-placeholder {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ts-photo-initials-large {
                font-size: 3.5rem;
                font-weight: 700;
                color: ${CONFIG.colors.authorInitialsColor};
                letter-spacing: 0.02em;
                user-select: none;
            }

            .ts-photo-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 52px 20px 20px;
                background: linear-gradient(to bottom, ${CONFIG.colors.photoOverlayGradient});
            }

            .ts-author-name {
                font-size: 0.85rem;
                font-weight: 800;
                color: ${CONFIG.colors.authorNameColor};
                text-transform: uppercase;
                letter-spacing: 0.1em;
                margin: 0 0 5px 0;
                line-height: 1.2;
            }

            .ts-author-role {
                font-size: 0.8rem;
                color: ${CONFIG.colors.authorRoleColor};
                margin: 0;
                line-height: 1.3;
            }

            /* ---- Navegação ---- */
            .ts-nav {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 16px;
                margin-top: 40px;
                flex-wrap: wrap;
            }

            .ts-arrow {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: ${CONFIG.colors.arrowBackground};
                border: 1px solid ${CONFIG.colors.arrowBorder};
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
                padding: 0;
                outline: none;
                flex-shrink: 0;
                line-height: 1;
            }

            .ts-arrow:hover:not(:disabled) {
                background: ${CONFIG.colors.arrowHover};
                border-color: #bbb;
            }

            .ts-arrow:focus-visible {
                outline: 2px solid ${CONFIG.colors.dotActive};
                outline-offset: 2px;
            }

            .ts-arrow:disabled {
                opacity: 0.3;
                cursor: default;
            }

            .ts-arrow svg {
                width: 18px;
                height: 18px;
                fill: none;
                stroke: ${CONFIG.colors.arrowIcon};
                stroke-width: 2.2;
                stroke-linecap: round;
                stroke-linejoin: round;
                pointer-events: none;
            }

            .ts-dots {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                justify-content: center;
            }

            .ts-dot {
                width: 8px;
                height: 8px;
                border-radius: 4px;
                background: ${CONFIG.colors.dotInactive};
                border: none;
                cursor: pointer;
                padding: 0;
                transition: background 0.25s ease, width 0.25s ease;
                outline: none;
                flex-shrink: 0;
            }

            .ts-dot.ts-dot-active {
                background: ${CONFIG.colors.dotActive};
                width: 24px;
            }

            .ts-dot:focus-visible {
                outline: 2px solid ${CONFIG.colors.dotActive};
                outline-offset: 2px;
            }

            /* ---- Responsivo ---- */
            @media (max-width: 1023px) {
                .ts-section {
                    padding: 52px 16px;
                }
                ${CONFIG.quoteMaxLines.tablet !== CONFIG.quoteMaxLines.desktop ? `
                .ts-quote-text {
                    ${CONFIG.quoteMaxLines.tablet > 0 ? `
                    display: -webkit-box;
                    -webkit-line-clamp: ${CONFIG.quoteMaxLines.tablet};
                    -webkit-box-orient: vertical;
                    overflow: hidden;` : `
                    display: block;
                    -webkit-line-clamp: unset;
                    overflow: visible;`}
                }` : ''}
            }

            @media (max-width: 599px) {
                .ts-section {
                    padding: 44px 12px;
                }
                .ts-card {
                    padding: 0 ${Math.max(CONFIG.cardGap / 4, 6)}px;
                }
                .ts-quote-box {
                    padding: 22px 20px 16px;
                }
                .ts-header {
                    margin-bottom: 32px;
                }
                ${CONFIG.quoteMaxLines.mobile !== CONFIG.quoteMaxLines.tablet ? `
                .ts-quote-text {
                    ${CONFIG.quoteMaxLines.mobile > 0 ? `
                    display: -webkit-box;
                    -webkit-line-clamp: ${CONFIG.quoteMaxLines.mobile};
                    -webkit-box-orient: vertical;
                    overflow: hidden;` : `
                    display: block;
                    -webkit-line-clamp: unset;
                    overflow: visible;`}
                }` : ''}
            }

            /* ---- Modo lista ---- */
            .ts-list {
                display: grid;
                grid-template-columns: repeat(${CONFIG.listColumns.desktop}, 1fr);
                gap: 24px;
            }

            @media (max-width: 1023px) {
                .ts-list {
                    grid-template-columns: repeat(${CONFIG.listColumns.tablet}, 1fr);
                }
            }

            @media (max-width: 599px) {
                .ts-list {
                    grid-template-columns: repeat(${CONFIG.listColumns.mobile}, 1fr);
                }
            }

            .ts-list-item {
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            .ts-list-item .ts-card-inner {
                height: 100%;
            }

            /* ---- Produto flutuante (aparece no topo da foto) ---- */
            .ts-product-float {
                position: absolute;
                top: 10px;
                left: 10px;
                z-index: 2;
                display: flex;
                align-items: center;
                height: 54px;
                background: rgba(255, 255, 255, 0.93);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
                max-width: 54px;
                transition: max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .ts-photo-box:hover .ts-product-float {
                max-width: 280px;
            }

            .ts-product-float-img {
                width: 54px;
                height: 54px;
                object-fit: cover;
                flex-shrink: 0;
                display: block;
            }

            .ts-product-float-body {
                padding: 6px 10px 6px 8px;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 3px;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.2s ease 0.1s;
            }

            .ts-photo-box:hover .ts-product-float-body {
                opacity: 1;
            }

            .ts-product-float-name {
                font-size: 0.72rem;
                font-weight: 600;
                color: ${CONFIG.colors.productNameColor};
                margin: 0;
                line-height: 1.35;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 180px;
            }

            .ts-product-float-link {
                font-size: 0.65rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                text-decoration: none;
                color: ${CONFIG.colors.viewProductBackground};
                transition: opacity 0.2s ease;
            }

            .ts-product-float-link:hover {
                opacity: 0.7;
            }

            .ts-product-float-loading {
                padding: 0 14px;
                font-size: 0.72rem;
                color: #bbb;
                white-space: nowrap;
            }

            /* ---- Botão ver todos ---- */
            .ts-view-all-wrap {
                text-align: center;
                margin-top: 36px;
            }

            .ts-view-all {
                display: inline-block;
                font-size: 0.88rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                text-decoration: none;
                color: ${CONFIG.colors.viewAllTextColor};
                background: ${CONFIG.colors.viewAllBackground};
                border: 1px solid ${CONFIG.colors.viewAllBorder};
                border-radius: 100px;
                padding: 14px 40px;
                transition: background 0.2s ease;
            }

            .ts-view-all:hover {
                background: ${CONFIG.colors.viewAllHover};
            }
        </style>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class TestimonialsSlider {
        constructor() {
            this.currentIndex = 0;
            this.isAnimating = false;
            this.autoplayTimer = null;
            this.resizeTimer = null;
            this.touchStartX = 0;
            this.touchEndX = 0;
            this.isDragging = false;
            this.dragStartX = 0;
            this.dragCurrentX = 0;
            this.dragMoved = false;
            this.visibleCount = 1;
            this.displayedTestimonials = CONFIG.testimonials;
            this.totalSlides = CONFIG.testimonials.length;

            this.init();
        }

        init() {
            if (!CONFIG.active) return;
            if (!CONFIG.testimonials || CONFIG.testimonials.length === 0) return;

            // Aplicar limite de itens no modo slider
            this.displayedTestimonials = CONFIG.testimonials;
            if (CONFIG.displayMode === 'slider' && CONFIG.sliderLimit > 0) {
                this.displayedTestimonials = CONFIG.testimonials.slice(0, CONFIG.sliderLimit);
            }
            this.totalSlides = this.displayedTestimonials.length;

            this.injectStyles();

            // Modo lista
            if (CONFIG.displayMode === 'list') {
                this.renderList();
                this.setupListElements();
                this.loadProductCards(); // fire and forget — async
                return;
            }

            // Modo slider (padrão)
            this.render();
            this.setupElements();
            this.visibleCount = this.getVisible();
            this.buildTrack();
            this.buildDots();
            this.goTo(0, false);
            this.setupEventListeners();
            if (CONFIG.autoplay) this.startAutoplay();
            this.loadProductCards(); // fire and forget — async
        }

        injectStyles() {
            if (!document.getElementById(STYLES_ID)) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        getVisible() {
            const w = window.innerWidth;
            if (w >= 1024) return CONFIG.visibleCards.desktop;
            if (w >= 600) return CONFIG.visibleCards.tablet;
            return CONFIG.visibleCards.mobile;
        }

        // Sanitiza texto para evitar XSS
        escHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        getInitials(name) {
            if (!name) return '?';
            return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
        }

        cardWidthPct() {
            return (100 / this.visibleCount).toFixed(5);
        }

        buildCardHTML(t, index) {
            const safeQuote = this.escHtml(t.quote || '');
            const safeAuthor = this.escHtml(t.author || '');
            const safeRole = t.role ? this.escHtml(t.role) : '';
            const initials = this.getInitials(t.author);

            let photoContent;
            if (t.photo) {
                const safePhoto = this.escHtml(t.photo);
                photoContent = `
                    <img
                        class="ts-photo-img"
                        src="${safePhoto}"
                        alt="${safeAuthor}"
                        loading="lazy"
                        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
                    >
                    <div class="ts-photo-placeholder" style="display:none" aria-hidden="true">
                        <span class="ts-photo-initials-large">${initials}</span>
                    </div>
                `;
            } else {
                photoContent = `
                    <div class="ts-photo-placeholder" aria-hidden="true">
                        <span class="ts-photo-initials-large">${initials}</span>
                    </div>
                `;
            }

            const productFloatHTML = t.productId ? `
                <div class="ts-product-float" data-product-id="${this.escHtml(String(t.productId))}">
                    <span class="ts-product-float-loading">...</span>
                </div>
            ` : '';

            return `
                <div class="ts-card" data-index="${index}" style="width:${this.cardWidthPct()}%" role="group" aria-label="Depoimento ${index + 1} de ${this.totalSlides}">
                    <div class="ts-card-inner">
                        <div class="ts-quote-box">
                            <span class="ts-quote-open" aria-hidden="true">&ldquo;</span>
                            <p class="ts-quote-text">${safeQuote}</p>
                            <span class="ts-quote-close" aria-hidden="true">&rdquo;</span>
                        </div>
                        <div class="ts-photo-box">
                            ${photoContent}
                            <div class="ts-photo-overlay">
                                <p class="ts-author-name">${safeAuthor}</p>
                                ${safeRole ? `<p class="ts-author-role">${safeRole}</p>` : ''}
                            </div>
                            ${productFloatHTML}
                        </div>
                    </div>
                </div>
            `;
        }

        render() {
            const existing = document.getElementById(SECTION_ID);
            if (existing) existing.remove();
            const titleHTML = CONFIG.showTitle ? `
                <div class="ts-header">
                    <h2 class="ts-title">${this.escHtml(CONFIG.title)}</h2>
                    ${CONFIG.subtitle ? `<p class="ts-subtitle">${this.escHtml(CONFIG.subtitle)}</p>` : ''}
                </div>
            ` : '';

            const navHTML = (CONFIG.showArrows || CONFIG.showDots) ? `
                <div class="ts-nav">
                    ${CONFIG.showArrows ? `
                    <button class="ts-arrow ts-arrow-prev" type="button" aria-label="Depoimento anterior">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>` : ''}
                    ${CONFIG.showDots ? `<div class="ts-dots" role="tablist" aria-label="Navegação de depoimentos"></div>` : ''}
                    ${CONFIG.showArrows ? `
                    <button class="ts-arrow ts-arrow-next" type="button" aria-label="Próximo depoimento">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>` : ''}
                </div>
            ` : '';

            const viewAllHTML = CONFIG.showViewAll && CONFIG.viewAllUrl ? `
                <div class="ts-view-all-wrap">
                    <a class="ts-view-all" href="${this.escHtml(CONFIG.viewAllUrl)}" target="${this.escHtml(CONFIG.viewAllTarget)}">${this.escHtml(CONFIG.viewAllText)}</a>
                </div>
            ` : '';

            const extraClass = CONFIG.containerClass ? ` ${CONFIG.containerClass}` : '';

            const html = `
                <section id="${SECTION_ID}" class="ts-section${extraClass}" aria-label="Depoimentos de clientes">
                    <div class="ts-inner">
                        ${titleHTML}
                        <div class="ts-viewport" role="region" tabindex="0" aria-live="polite">
                            <div class="ts-track"></div>
                        </div>
                        ${navHTML}
                        ${viewAllHTML}
                    </div>
                </section>
            `;

            const target = document.querySelector(CONFIG.insertSelector) || document.body;
            target.insertAdjacentHTML(CONFIG.insertMethod, html);
        }

        setupElements() {
            this.section = document.getElementById(SECTION_ID);
            this.track = this.section.querySelector('.ts-track');
            this.viewport = this.section.querySelector('.ts-viewport');
            this.btnPrev = this.section.querySelector('.ts-arrow-prev');
            this.btnNext = this.section.querySelector('.ts-arrow-next');
            this.dotsContainer = this.section.querySelector('.ts-dots');
        }

        buildTrack() {
            this.track.innerHTML = '';
            this.displayedTestimonials.forEach((t, i) => {
                this.track.insertAdjacentHTML('beforeend', this.buildCardHTML(t, i));
            });
        }

        updateCardWidths() {
            const pct = this.cardWidthPct();
            this.track.querySelectorAll('.ts-card').forEach(c => {
                c.style.width = pct + '%';
            });
        }

        buildDots() {
            if (!this.dotsContainer) return;
            const maxIndex = Math.max(0, this.totalSlides - this.visibleCount);
            const count = maxIndex + 1;
            this.dotsContainer.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const btn = document.createElement('button');
                btn.className = 'ts-dot' + (i === 0 ? ' ts-dot-active' : '');
                btn.type = 'button';
                btn.setAttribute('role', 'tab');
                btn.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
                btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                btn.addEventListener('click', () => {
                    this.goTo(i);
                    this.stopAutoplay();
                });
                this.dotsContainer.appendChild(btn);
            }
        }

        maxIndex() {
            return Math.max(0, this.totalSlides - this.visibleCount);
        }

        goTo(index, animate = true) {
            if (this.isAnimating && animate) return;

            this.currentIndex = Math.max(0, Math.min(index, this.maxIndex()));

            if (!animate) {
                this.track.classList.add('ts-no-transition');
            }

            const offset = this.currentIndex * (100 / this.visibleCount);
            this.track.style.transform = `translateX(-${offset}%)`;

            if (!animate) {
                void this.track.offsetHeight; // força reflow para aplicar posição sem animar
                this.track.classList.remove('ts-no-transition');
            } else {
                this.isAnimating = true;
                setTimeout(() => { this.isAnimating = false; }, 460);
            }

            this.updateNav();
        }

        prev() {
            if (this.currentIndex <= 0) {
                if (CONFIG.loop) this.goTo(this.maxIndex());
                return;
            }
            this.goTo(this.currentIndex - 1);
        }

        next() {
            if (this.currentIndex >= this.maxIndex()) {
                if (CONFIG.loop) this.goTo(0);
                return;
            }
            this.goTo(this.currentIndex + 1);
        }

        updateNav() {
            const max = this.maxIndex();

            if (this.btnPrev) {
                this.btnPrev.disabled = !CONFIG.loop && this.currentIndex <= 0;
            }
            if (this.btnNext) {
                this.btnNext.disabled = !CONFIG.loop && this.currentIndex >= max;
            }

            if (this.dotsContainer) {
                this.dotsContainer.querySelectorAll('.ts-dot').forEach((d, i) => {
                    const active = i === this.currentIndex;
                    d.classList.toggle('ts-dot-active', active);
                    d.setAttribute('aria-selected', active ? 'true' : 'false');
                });
            }
        }

        startAutoplay() {
            this.stopAutoplay();
            this.autoplayTimer = setInterval(() => this.next(), CONFIG.autoplayDelay);
        }

        stopAutoplay() {
            if (this.autoplayTimer) {
                clearInterval(this.autoplayTimer);
                this.autoplayTimer = null;
            }
        }

        setupEventListeners() {
            if (this.btnPrev) {
                this.btnPrev.addEventListener('click', () => {
                    this.prev();
                    this.stopAutoplay();
                });
            }

            if (this.btnNext) {
                this.btnNext.addEventListener('click', () => {
                    this.next();
                    this.stopAutoplay();
                });
            }

            // Swipe touch
            this.viewport.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            this.viewport.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                const diff = this.touchStartX - this.touchEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) this.next();
                    else this.prev();
                    this.stopAutoplay();
                }
            }, { passive: true });

            // Arrastar com mouse
            this.viewport.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                this.isDragging = true;
                this.dragMoved = false;
                this.dragStartX = e.clientX;
                this.dragCurrentX = e.clientX;
                this.viewport.classList.add('ts-dragging');
                this.track.classList.add('ts-no-transition');
                this.stopAutoplay();
                e.preventDefault();
            });

            window.addEventListener('mousemove', (e) => {
                if (!this.isDragging) return;
                const delta = e.clientX - this.dragStartX;
                if (Math.abs(delta) > 4) this.dragMoved = true;
                this.dragCurrentX = e.clientX;
                const baseOffset = this.currentIndex * (100 / this.visibleCount);
                const pxPerPct = this.viewport.offsetWidth / 100;
                const deltaPct = (e.clientX - this.dragStartX) / pxPerPct;
                this.track.style.transform = `translateX(calc(-${baseOffset}% + ${e.clientX - this.dragStartX}px))`;
            });

            const endDrag = (e) => {
                if (!this.isDragging) return;
                this.isDragging = false;
                this.viewport.classList.remove('ts-dragging');
                this.track.classList.remove('ts-no-transition');

                const delta = this.dragCurrentX - this.dragStartX;
                const threshold = this.viewport.offsetWidth / (this.visibleCount * 2.5);

                if (this.dragMoved && Math.abs(delta) > threshold) {
                    if (delta < 0) this.next();
                    else this.prev();
                } else {
                    // Volta para o slide atual sem mover
                    this.goTo(this.currentIndex);
                }

                if (CONFIG.autoplay) this.startAutoplay();
            };

            window.addEventListener('mouseup', endDrag);

            // Cancela o drag se o mouse sair da janela
            window.addEventListener('mouseleave', endDrag);

            // Impede que cliques sejam disparados após um drag
            this.viewport.addEventListener('click', (e) => {
                if (this.dragMoved) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.dragMoved = false;
                }
            }, true);

            // Pausa o autoplay ao passar o mouse (apenas quando não está arrastando)
            if (CONFIG.autoplay) {
                this.section.addEventListener('mouseenter', () => { if (!this.isDragging) this.stopAutoplay(); });
                this.section.addEventListener('mouseleave', () => { if (!this.isDragging) this.startAutoplay(); });
            }

            // Navegação por teclado
            this.viewport.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') { this.prev(); this.stopAutoplay(); }
                if (e.key === 'ArrowRight') { this.next(); this.stopAutoplay(); }
            });

            // Adaptação ao redimensionamento
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimer);
                this.resizeTimer = setTimeout(() => this.onResize(), 200);
            });
        }

        onResize() {
            const newVisible = this.getVisible();
            if (newVisible !== this.visibleCount) {
                this.visibleCount = newVisible;
                this.updateCardWidths();
                this.buildDots();
                this.goTo(Math.min(this.currentIndex, this.maxIndex()), false);
            }
        }

        // ========================================
        // MODO LISTA
        // ========================================
        renderList() {
            const existing = document.getElementById(SECTION_ID);
            if (existing) existing.remove();

            const titleHTML = CONFIG.showTitle ? `
                <div class="ts-header">
                    <h2 class="ts-title">${this.escHtml(CONFIG.title)}</h2>
                    ${CONFIG.subtitle ? `<p class="ts-subtitle">${this.escHtml(CONFIG.subtitle)}</p>` : ''}
                </div>
            ` : '';

            const itemsHTML = CONFIG.testimonials.map((t, i) => this.buildListItemHTML(t, i)).join('');

            const viewAllHTML = CONFIG.showViewAll && CONFIG.viewAllUrl ? `
                <div class="ts-view-all-wrap">
                    <a class="ts-view-all" href="${this.escHtml(CONFIG.viewAllUrl)}" target="${this.escHtml(CONFIG.viewAllTarget)}">${this.escHtml(CONFIG.viewAllText)}</a>
                </div>
            ` : '';

            const extraClass = CONFIG.containerClass ? ` ${CONFIG.containerClass}` : '';

            const html = `
                <section id="${SECTION_ID}" class="ts-section${extraClass}" aria-label="Depoimentos de clientes">
                    <div class="ts-inner">
                        ${titleHTML}
                        <div class="ts-list">
                            ${itemsHTML}
                        </div>
                        ${viewAllHTML}
                    </div>
                </section>
            `;

            const target = document.querySelector(CONFIG.insertSelector) || document.body;
            target.insertAdjacentHTML(CONFIG.insertMethod, html);
        }

        setupListElements() {
            this.section = document.getElementById(SECTION_ID);
        }

        buildListItemHTML(t, index) {
            const safeQuote = this.escHtml(t.quote || '');
            const safeAuthor = this.escHtml(t.author || '');
            const safeRole = t.role ? this.escHtml(t.role) : '';
            const initials = this.getInitials(t.author);

            let photoContent;
            if (t.photo) {
                const safePhoto = this.escHtml(t.photo);
                photoContent = `
                    <img
                        class="ts-photo-img"
                        src="${safePhoto}"
                        alt="${safeAuthor}"
                        loading="lazy"
                        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
                    >
                    <div class="ts-photo-placeholder" style="display:none" aria-hidden="true">
                        <span class="ts-photo-initials-large">${initials}</span>
                    </div>
                `;
            } else {
                photoContent = `
                    <div class="ts-photo-placeholder" aria-hidden="true">
                        <span class="ts-photo-initials-large">${initials}</span>
                    </div>
                `;
            }

            const productFloatHTML = t.productId ? `
                <div class="ts-product-float" data-product-id="${this.escHtml(String(t.productId))}">
                    <span class="ts-product-float-loading">...</span>
                </div>
            ` : '';

            return `
                <div class="ts-list-item" role="group" aria-label="Depoimento ${index + 1}">
                    <div class="ts-card-inner">
                        <div class="ts-quote-box">
                            <span class="ts-quote-open" aria-hidden="true">&ldquo;</span>
                            <p class="ts-quote-text">${safeQuote}</p>
                            <span class="ts-quote-close" aria-hidden="true">&rdquo;</span>
                        </div>
                        <div class="ts-photo-box">
                            ${photoContent}
                            <div class="ts-photo-overlay">
                                <p class="ts-author-name">${safeAuthor}</p>
                                ${safeRole ? `<p class="ts-author-role">${safeRole}</p>` : ''}
                            </div>
                            ${productFloatHTML}
                        </div>
                    </div>
                </div>
            `;
        }

        async fetchProduct(productId) {
            if (!CONFIG.storeUrl) return null;
            try {
                const base = CONFIG.storeUrl.replace(/\/$/, '');
                const url = base + '/_search?filters=product_ids:' + encodeURIComponent(productId) ;
                const res = await fetch(url);
                if (!res.ok) return null;
                const data = await res.json();
                if (!data.products || data.products.length === 0) return null;
                return data.products[0];
            } catch (e) {
                return null;
            }
        }

        buildProductCardContent(product) {
            const imgBase = 'https://cdn.awsli.com.br/200x200';
            const rawImage = product.preview_images && product.preview_images[0] ? product.preview_images[0] : '';
            const imageUrl = rawImage
                ? (rawImage.startsWith('http') ? rawImage : imgBase + rawImage)
                : '';
            const storeBase = (CONFIG.storeUrl || '').replace(/\/$/, '');
            const rawUrl = product.url || '';
            const productUrl = rawUrl
                ? (rawUrl.startsWith('http') ? rawUrl : storeBase + rawUrl)
                : '#';
            const safeName = this.escHtml(product.name || '');
            const safeUrl = this.escHtml(productUrl);
            const safeLabel = this.escHtml(CONFIG.viewProductLabel);

            const imgHTML = imageUrl ? `
                <img class="ts-product-float-img" src="${this.escHtml(imageUrl)}" alt="${safeName}" loading="lazy">
            ` : '';

            return `
                ${imgHTML}
                <div class="ts-product-float-body">
                    <p class="ts-product-float-name">${safeName}</p>
                    <a class="ts-product-float-link" href="${safeUrl}?utm_source=testimonials" target="_blank" rel="noopener noreferrer">${safeLabel}</a>
                </div>
            `;
        }

        async loadProductCards() {
            if (!this.section) return;
            const cards = this.section.querySelectorAll('[data-product-id]');
            const promises = Array.from(cards).map(async (card) => {
                const productId = card.getAttribute('data-product-id');
                const product = await this.fetchProduct(productId);
                if (product) {
                    card.innerHTML = this.buildProductCardContent(product);
                } else {
                    card.remove();
                }
            });
            await Promise.all(promises);
        }

        // ========================================
        // API PÚBLICA
        // ========================================
        destroy() {
            this.stopAutoplay();
            clearTimeout(this.resizeTimer);
            if (this.section) this.section.remove();
            const styles = document.getElementById(STYLES_ID);
            if (styles) styles.remove();
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================
    function initTestimonialsSlider() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.TestimonialsSlider = new TestimonialsSlider();
            });
        } else {
            window.TestimonialsSlider = new TestimonialsSlider();
        }
    }

    initTestimonialsSlider();

})();
