/**
 * Upsell Cross Sell - Vitrines de upselling e cross-selling para produto, carrinho e checkout
 */


(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.UpsellCrossSellConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        active: true,

        // Prefixo da URL das imagens (ex: "https://cdn.awsli.com.br/600x450/")
        imageBaseUrl: '',

        // ── Página de produto (.pagina-produto) ─────────────────────────────
        productPage: {
            active: true,
            title: 'Você também pode gostar',

            // Fonte dos produtos: 'compre_junto' | 'category' | 'keywords' | 'none'
            // compre_junto: usa /compre_junto/PRODUTO_ID + fallback automático pela categoria
            // category:     usa a categoria definida em categoryId
            // keywords:     busca por palavra-chave definida em parameter (/_search?q=...)
            // none:         exibe apenas os produtos em fixedProductIds
            // 'fixed' é alias de 'none' (retrocompatibilidade)
            source: 'compre_junto',
            categoryId: '',
            parameter: [],           // palavra(s)-chave de busca, usado quando source = 'keywords'
                                     // string simples ou array de strings; cada termo é buscado separadamente e os resultados são mesclados
            fixedProductIds: [],     // exibidos PRIMEIRO, antes dos produtos dinâmicos

            maxProducts: 9,          // total máximo de produtos exibidos
            layout: 'list',          // 'list' | 'grid' | 'slider'
            cardsPerRow: 3,          // colunas na grade, usado quando layout = 'grid'
            sort: 'most_sold',       // 'most_sold' | 'price_asc' | 'price_desc'

            insertSelector: '.produto-detalhe',
            insertMethod: 'afterend', // 'beforeend' | 'afterbegin' | 'beforebegin' | 'afterend'

            // Callback chamado após adicionar ao carrinho: function(response, skuId) {}
            onAddToCart: null
        },

        // ── Página de carrinho (.pagina-carrinho:not(.carrinho-checkout)) ──
        cart: {
            active: true,

            // Array de seções. Cada seção gera um bloco independente (slider, grid ou lista).
            sections: [
                {
                    id: 'ucs-cart-relacionados',
                    title: 'Leve também',

                    // Fonte: 'compre_junto' | 'category' | 'keywords' | 'product_map' | 'none'
                    // compre_junto:  busca compre_junto para cada produto no carrinho e mescla
                    // category:      exibe produtos da categoria informada em categoryId
                    // keywords:      busca por palavra-chave definida em parameter (/_search?q=...)
                    // product_map:   mapa { "ID_PRODUTO_CARRINHO": ["ID_REC_1", "ID_REC_2"] }
                    // none:          exibe apenas os produtos em fixedProductIds
                    // 'fixed' é alias de 'none' (retrocompatibilidade)
                    source: 'compre_junto',
                    categoryId: '',
                    parameter: [],        // palavra(s)-chave de busca, usado quando source = 'keywords'
                                          // string simples ou array de strings; cada termo é buscado separadamente e os resultados são mesclados
                    fixedProductIds: [],  // exibidos PRIMEIRO, antes dos dinâmicos
                    productMap: {},

                    maxProducts: 6,
                    layout: 'slider',    // 'list' | 'grid' | 'slider'
                    slidesPerView: 3,    // itens visíveis por vez (quando layout = 'slider', desktop)
                    sort: 'most_sold',   // 'most_sold' | 'price_asc' | 'price_desc'

                    insertSelector: '.pagina-carrinho',
                    insertMethod: 'beforeend',

                    // Callback chamado após adicionar ao carrinho: function(response, skuId) {}
                    onAddToCart: null
                }
            ]
        },

        // ── Checkout (.pagina-carrinho.carrinho-checkout) ────────────────────
        checkout: {
            active: true,
            title: 'Aproveite e leve também',

            // Fonte: 'lowest_related' | 'compre_junto' | 'category' | 'keywords' | 'none'
            // lowest_related: busca categorias dos produtos no carrinho; retorna relacionados
            // compre_junto:   usa /compre_junto/ dos produtos no carrinho
            // category:       exibe produtos da categoria informada em categoryId
            // keywords:       busca por palavra-chave definida em parameter (/_search?q=...)
            // none:           exibe apenas os produtos em fixedProductIds
            // 'fixed' é alias de 'none' (retrocompatibilidade)
            source: 'lowest_related',
            categoryId: '',
            parameter: [],           // palavra(s)-chave de busca, usado quando source = 'keywords'
                                     // string simples ou array de strings; cada termo é buscado separadamente e os resultados são mesclados
            fixedProductIds: [],     // exibidos PRIMEIRO; com maxProducts=1 o produto fixo substitui o dinâmico
            maxProducts: 1,          // 1 para layout 'single'; aumente se usar 'slider'
            layout: 'single',        // 'single' (1 produto compacto) | 'slider'
            slidesPerView: 3,        // usado quando layout = 'slider'
            sort: 'price_asc',       // padrão para lowest_related

            insertSelector: '.resumo-compra',
            insertMethod: 'beforebegin',

            // Callback chamado após adicionar ao carrinho: function(response, skuId) {}
            onAddToCart: null
        },

        // CORES E ESTILOS
        colors: {
            sectionBackground:  '#f9fafb',
            sectionBorder:      '#e5e7eb',
            titleColor:         '#111827',
            cardBackground:     '#ffffff',
            cardBorder:         '#e5e7eb',
            cardShadow:         'rgba(0,0,0,0.06)',
            textColor:          '#1f3a5f',
            textLight:          '#6b7280',
            priceColor:         '#111827',
            priceOldColor:      '#9ca3af',
            buttonBg:           '#1f3a5f',
            buttonText:         '#ffffff',
            buttonHoverBg:      '#1f3a5f',
            buttonSuccessBg:    '#32bcad',
            buttonErrorBg:      '#dc2626',
            sliderArrowBg:      '#ffffff',
            sliderArrowBorder:  '#e5e7eb',
            sliderArrowIcon:    '#1f3a5f',
            modalOverlay:       'rgba(0,0,0,0.5)',
            modalBackground:    '#ffffff',
            skuOptionBorder:    '#e5e7eb',
            skuOptionHoverBg:   '#f3f4f6',
            skuOptionActiveBg:  '#f0fdf4',
            skuOptionActiveBorder: '#32bcad'
        }
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.UpsellCrossSellConfig && typeof window.UpsellCrossSellConfig === 'object') {
        const userCfg = window.UpsellCrossSellConfig;

        Object.assign(CONFIG, userCfg);

        if (userCfg.colors && typeof userCfg.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, userCfg.colors);
        }

        // Merge de objetos nested (productPage, cart, checkout)
        ['productPage', 'cart', 'checkout'].forEach(function (key) {
            if (userCfg[key] && typeof userCfg[key] === 'object') {
                CONFIG[key] = Object.assign({}, DEFAULT_CONFIG[key], userCfg[key]);
            }
        });

        // Merge individual de sections (preserva defaults de cada section)
        if (userCfg.cart && Array.isArray(userCfg.cart.sections)) {
            CONFIG.cart.sections = userCfg.cart.sections;
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    // ─── CSS ────────────────────────────────────────────────────────────────
    const CSS_STYLES = `
        <style id="ucs-styles">
            /* Reset de box-sizing dentro do plugin */
            .ucs-section *,
            .ucs-sku-modal * {
                box-sizing: border-box;
            }

            /* ── Seção genérica ── */
            .ucs-section {
                margin: 24px 0;
                padding: 24px!important;
                background: ${CONFIG.colors.sectionBackground};
                border: 1px solid ${CONFIG.colors.sectionBorder};
                border-radius: 12px;
            }

            .ucs-section-title {
                font-size: 16px;
                font-weight: 700;
                color: ${CONFIG.colors.titleColor};
                margin: 0 0 20px 0;
                text-transform: uppercase;
                letter-spacing: 0.04em;
            }

            /* ── Card de produto ── */
            .ucs-card {
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 10px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                transition: box-shadow 0.2s ease, transform 0.2s ease;
            }

            .ucs-card:hover {
                box-shadow: 0 4px 16px ${CONFIG.colors.cardShadow};
                transform: translateY(-2px);
            }

            .ucs-card-img-wrap {
                display: block;
                width: 100%;
                padding-top: 100%;
                position: relative;
                overflow: hidden;
                background: #f3f4f6;
                text-decoration: none;
            }

            .ucs-card-img-wrap img {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: contain;
                background:#fff;
                transition: transform 0.3s ease;
            }

            .ucs-card:hover .ucs-card-img-wrap img {
                transform: scale(1.04);
            }

            .ucs-card-body {
                padding: 12px;
                display: flex;
                flex-direction: column;
                flex: 1;
                gap: 8px;
            }

            .ucs-card-name {
                font-size: 13px;
                font-weight: 600;
                color: ${CONFIG.colors.textColor};
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-decoration: none;
                margin: 0;
            }

            .ucs-card-name:hover {
                text-decoration: underline;
            }

            .ucs-card-prices {
                display: flex;
                align-items: baseline;
                gap: 6px;
                flex-wrap: wrap;
            }

            .ucs-price {
                font-size: 15px;
                font-weight: 700;
                color: ${CONFIG.colors.priceColor};
            }

            .ucs-price-from {
                font-size: 11px;
                font-weight: 400;
                color: ${CONFIG.colors.textLight};
                margin-right: 2px;
            }

            .ucs-price-old {
                font-size: 12px;
                color: ${CONFIG.colors.priceOldColor};
                text-decoration: line-through;
            }

            .ucs-btn {
                display: block;
                width: 100%;
                padding: 9px 12px;
                background: ${CONFIG.colors.buttonBg};
                color: ${CONFIG.colors.buttonText};
                border: none;
                border-radius: 7px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s ease, transform 0.15s ease;
                text-align: center;
                margin-top: auto;
                letter-spacing: 0.01em;
            }

            .ucs-btn:hover:not(:disabled) {
                background: ${CONFIG.colors.buttonHoverBg};
                transform: translateY(-1px);
            }

            .ucs-btn:disabled {
                cursor: default;
                opacity: 0.85;
            }

            .ucs-btn.ucs-btn-loading {
                opacity: 0.7;
                cursor: wait;
            }

            .ucs-btn.ucs-btn-success {
                background: ${CONFIG.colors.buttonSuccessBg};
            }

            .ucs-btn.ucs-btn-error {
                background: ${CONFIG.colors.buttonErrorBg};
            }

            /* ── Página de produto: grade ── */
            .ucs-product-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr); /* sobreposto por inline style por seção */
                gap: 16px;
            }

            @media (max-width: 768px) {
                .ucs-product-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
            }

            @media (max-width: 480px) {
                .ucs-product-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }
                .ucs-section {
                    padding: 16px;
                }
            }

            /* ── Página de produto: lista horizontal ── */
            .ucs-product-list {
                display: flex;
                flex-direction: column;
            }

            .ucs-list-item {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 14px 0;
                border-bottom: 1px solid ${CONFIG.colors.cardBorder};
            }

            .ucs-list-item:first-child { padding-top: 0; }
            .ucs-list-item:last-child  { border-bottom: none; padding-bottom: 0; }

            .ucs-list-img-wrap {
                width: 72px;
                height: 72px;
                flex-shrink: 0;
                border-radius: 8px;
                overflow: hidden;
                background: #f3f4f6;
                display: block;
                text-decoration: none;
            }

            .ucs-list-img-wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }

            .ucs-list-item:hover .ucs-list-img-wrap img {
                transform: scale(1.04);
            }

            .ucs-list-info {
                flex: 1;
                min-width: 0;
            }

            .ucs-list-name {
                font-size: 13px;
                font-weight: 500;
                color: ${CONFIG.colors.textColor};
                text-decoration: none;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .ucs-list-name:hover { text-decoration: underline; }

            .ucs-list-price {
                font-size: 14px;
                font-weight: 700;
                color: ${CONFIG.colors.priceColor};
                margin-top: 2px;
                display: inline-block;
            }

            .ucs-list-price-from {
                font-size: 11px;
                font-weight: 400;
                color: ${CONFIG.colors.textLight};
                margin-right: 2px;
            }

            .ucs-list-price-old {
                font-size: 12px;
                color: ${CONFIG.colors.priceOldColor};
                text-decoration: line-through;
                margin-left: 4px;
            }

            .ucs-btn-outline {
                flex-shrink: 0;
                width: auto;
                background: transparent;
                color: ${CONFIG.colors.buttonBg};
                border: 2px solid ${CONFIG.colors.buttonBg};
                border-radius: 999px;
                padding: 8px 18px;
                white-space: nowrap;
                margin-top: 0;
                font-size: 13px;
                font-weight: 600;
            }

            .ucs-btn-outline:hover:not(:disabled) {
                background: ${CONFIG.colors.buttonBg};
                color: ${CONFIG.colors.buttonText};
                transform: none;
            }

            .ucs-btn-outline.ucs-btn-success {
                background: ${CONFIG.colors.buttonSuccessBg};
                border-color: ${CONFIG.colors.buttonSuccessBg};
                color: #fff;
            }

            .ucs-btn-outline.ucs-btn-error {
                background: ${CONFIG.colors.buttonErrorBg};
                border-color: ${CONFIG.colors.buttonErrorBg};
                color: #fff;
            }

            /* ── Slider (carrinho) ── */
            .ucs-slider-wrap {
                position: relative;
            }

            .ucs-slider {
                overflow: hidden;
                border-radius: 8px;
               
            }

            .ucs-track {
                display: flex;
                transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform;
                user-select: none;
            }

            .ucs-slide {
                flex: 0 0 calc(100% / 3 - 11px);
                margin-right: 16px;
            }

            .ucs-slide:last-child {
                margin-right: 0;
            }

            @media (max-width: 768px) {
                .ucs-slide {
                    flex: 0 0 calc(50% - 8px);
                    margin-right: 16px;
                }
            }

            @media (max-width: 480px) {
                .ucs-slide {
                    flex: 0 0 calc(50% - 6px);
                    margin-right: 12px;
                }
            }

            .ucs-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: ${CONFIG.colors.sliderArrowBg};
                border: 1px solid ${CONFIG.colors.sliderArrowBorder};
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2;
                transition: opacity 0.2s ease, background 0.2s ease;
                padding: 0;
                outline: none;
                box-shadow: 0 2px 8px rgba(0,0,0,0.12);
            }

            .ucs-arrow:hover:not(:disabled) {
                background: #f3f4f6;
            }

            .ucs-arrow:disabled,
            .ucs-arrow[aria-disabled="true"] {
                opacity: 0;
                pointer-events: none;
            }

            .ucs-arrow svg {
                width: 16px;
                height: 16px;
                stroke: ${CONFIG.colors.sliderArrowIcon};
                fill: none;
                stroke-width: 2.2;
                stroke-linecap: round;
                stroke-linejoin: round;
                pointer-events: none;
            }

            .ucs-arrow-prev {
                left: -18px;
            }

            .ucs-arrow-next {
                right: -18px;
            }

            @media (max-width: 480px) {
                .ucs-arrow-prev { left: -14px; }
                .ucs-arrow-next { right: -14px; }
            }

            /* ── Slide row (slidesPerView = 1) ── */
            .ucs-slide-row .ucs-card {
                flex-direction: row;
            }

            .ucs-slide-row .ucs-card-img-wrap {
                width: 120px;
                height: 120px;
                flex-shrink: 0;
                padding-top: 0;
            }

            .ucs-slide-row .ucs-card-body {
                flex: 1;
                min-width: 0;
            }

            @media (max-width: 480px) {
                .ucs-slide-row .ucs-card-img-wrap {
                    width: 90px;
                    height: 90px;
                }
            }

            /* ── Checkout: card compacto ── */
            .ucs-checkout-card {
                display: flex;
                align-items: center;
                gap: 16px;
                background: ${CONFIG.colors.cardBackground};
                border: 1px solid ${CONFIG.colors.cardBorder};
                border-radius: 10px;
                padding: 14px;
            }

            .ucs-checkout-img {
                width: 72px;
                height: 72px;
                object-fit: cover;
                border-radius: 8px;
                flex-shrink: 0;
                background: #f3f4f6;
            }

            .ucs-checkout-info {
                flex: 1;
                min-width: 0;
            }

            .ucs-checkout-name {
                font-size: 13px;
                font-weight: 600;
                color: ${CONFIG.colors.textColor};
                margin: 0 0 4px 0;
                line-height: 1.35;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            .ucs-checkout-price {
                font-size: 15px;
                font-weight: 700;
                color: ${CONFIG.colors.priceColor};
                margin: 0 0 10px 0;
            }

            .ucs-checkout-card .ucs-btn {
                width: auto;
                padding: 8px 16px;
                font-size: 13px;
            }

            @media (max-width: 480px) {
                .ucs-checkout-card {
                    flex-wrap: wrap;
                }
                .ucs-checkout-img {
                    width: 56px;
                    height: 56px;
                }
            }

            /* ── SKU Modal ── */
            .ucs-sku-modal {
                position: fixed;
                inset: 0;
                background: ${CONFIG.colors.modalOverlay};
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.22s ease, visibility 0.22s ease;
            }

            .ucs-sku-modal.ucs-modal-open {
                opacity: 1;
                visibility: visible;
            }

            .ucs-sku-dialog {
                background: ${CONFIG.colors.modalBackground};
                border-radius: 14px;
                padding: 24px;
                width: 100%;
                max-width: 420px;
                max-height: 85vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                transform: translateY(16px);
                transition: transform 0.22s ease;
            }

            .ucs-sku-modal.ucs-modal-open .ucs-sku-dialog {
                transform: translateY(0);
            }

            .ucs-sku-dialog-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                margin-bottom: 6px;
                gap: 12px;
            }

            .ucs-sku-product-name {
                font-size: 15px;
                font-weight: 700;
                color: ${CONFIG.colors.titleColor};
                margin: 0;
                line-height: 1.35;
            }

            .ucs-sku-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 2px;
                color: ${CONFIG.colors.textLight};
                flex-shrink: 0;
                display: flex;
                align-items: center;
                line-height: 1;
                border-radius: 4px;
            }

            .ucs-sku-close:hover { color: ${CONFIG.colors.textColor}; }

            .ucs-sku-close svg {
                width: 20px;
                height: 20px;
                stroke: currentColor;
                fill: none;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .ucs-sku-label {
                font-size: 12px;
                color: ${CONFIG.colors.textLight};
                margin: 0 0 12px 0;
            }

            .ucs-sku-options {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 16px;
            }

            .ucs-sku-option {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 11px 14px;
                border: 1px solid ${CONFIG.colors.skuOptionBorder};
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.15s ease, border-color 0.15s ease;
                background: none;
                width: 100%;
                text-align: left;
            }

            .ucs-sku-option:hover {
                background: ${CONFIG.colors.skuOptionHoverBg};
            }

            .ucs-sku-option.ucs-sku-selected {
                background: ${CONFIG.colors.skuOptionActiveBg};
                border-color: ${CONFIG.colors.skuOptionActiveBorder};
            }

            .ucs-sku-option-label {
                font-size: 13px;
                font-weight: 500;
                color: ${CONFIG.colors.textColor};
            }

            .ucs-sku-option-price {
                font-size: 13px;
                font-weight: 700;
                color: ${CONFIG.colors.priceColor};
                white-space: nowrap;
            }

            .ucs-sku-option[data-unavailable="true"] {
                opacity: 0.45;
                cursor: not-allowed;
            }

            .ucs-sku-option-badge {
                font-size: 10px;
                background: #fee2e2;
                color: #dc2626;
                border-radius: 4px;
                padding: 1px 5px;
                margin-left: 6px;
                font-weight: 600;
            }

            /* ── Loading skeleton placeholder ── */
            .ucs-loading {
                display: flex;
                gap: 16px;
            }

            .ucs-loading-card {
                flex: 1;
                border-radius: 10px;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: ucs-shimmer 1.4s infinite;
                height: 220px;
            }

            @keyframes ucs-shimmer {
                0%   { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            @keyframes ucs-fadeIn {
                from { opacity: 0; transform: translateY(8px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            .ucs-section { animation: ucs-fadeIn 0.35s ease; }
        </style>
    `;

    // ─── HTML MODAL ─────────────────────────────────────────────────────────
    const MODAL_TEMPLATE = `
        <div id="ucsSKUModal" class="ucs-sku-modal" role="dialog" aria-modal="true" aria-label="Selecionar opção">
            <div class="ucs-sku-dialog">
                <div class="ucs-sku-dialog-header">
                    <p class="ucs-sku-product-name" id="ucsModalProductName"></p>
                    <button class="ucs-sku-close" id="ucsModalClose" aria-label="Fechar">
                        <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <p class="ucs-sku-label" id="ucsModalLabel"></p>
                <div class="ucs-sku-options" id="ucsModalOptions"></div>
            </div>
        </div>
    `;

    // ══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatPrice(value) {
        return 'R$ ' + Number(value).toFixed(2).replace('.', ',');
    }

    // Busca itens do minicart via $.ajax, atualiza o sessionStorage e retorna Promise<items[]>.
    function fetchMinicartItems() {
        return new Promise(function (resolve) {
            $.ajax({ url: '/carrinho/minicart' })
                .done(function (data) {
                    if (!data || !data.carrinho || !Array.isArray(data.carrinho.items)) {
                        resolve([]);
                        return;
                    }
                    try { sessionStorage.setItem('carrinho_minicart', JSON.stringify(data)); } catch (e) {}
                    resolve(data.carrinho.items);
                })
                .fail(function () { resolve([]); });
        });
    }

    // Normaliza produto da API _search para formato interno
    function normalizeSearchProduct(p) {
        if (!p) return null;
        var skus = (p.skus || []).map(function (s) {
            return {
                id: String(s.id),
                price: s.price ? (s.price.selling || s.price.base || 0) : 0,
                priceOld: (s.price && s.price.base && s.price.selling && s.price.base > s.price.selling) ? s.price.base : null,
                variations: s.variations || null,
                available: s.available !== false && (s.inventory ? s.inventory.has_stock !== false : true)
            };
        });
        return {
            id: String(p.id),
            name: p.name || '',
            url: p.url || '#',
            image: p.preview_images && p.preview_images[0] ? CONFIG.imageBaseUrl + p.preview_images[0] : '',
            price: p.price ? (p.price.selling || p.price.base || 0) : 0,
            priceOld: (p.price && p.price.base && p.price.selling && p.price.base > p.price.selling) ? p.price.base : null,
            skus: skus,
            isMultiple: skus.length > 1,
            available: p.available !== false,
            unitsSold: p.units_sold || 0
        };
    }

    // Normaliza produto da API compre_junto para formato interno
    function normalizeCompraJuntoProduct(p) {
        if (!p || !p.isAvailable) return null;
        var skus = (p.skus || []).filter(function (s) {
            return s.is_available !== false && (s.storage ? s.storage.has_stock !== false : true);
        }).map(function (s) {
            var varLabel = '';
            if (s.variations && s.variations.length > 0) {
                varLabel = s.variations.map(function (v) {
                    return v.value ? v.value.name : '';
                }).join(' / ');
            }
            return {
                id: String(s.id),
                price: s.price ? (s.price.promotional || s.price.sell || 0) : 0,
                priceOld: (s.price && s.price.full && s.price.promotional && s.price.full > s.price.promotional) ? s.price.full : null,
                varLabel: varLabel,
                variations: s.variations || null,
                available: s.is_available !== false && (s.storage ? s.storage.has_stock !== false : true)
            };
        });
        if (skus.length === 0) return null;
        return {
            id: String(p.id),
            name: p.name || '',
            url: p.url || '#',
            image: p.image && p.image.url ? CONFIG.imageBaseUrl + p.image.url : '',
            price: skus[0].price,
            priceOld: skus[0].priceOld,
            skus: skus,
            isMultiple: p.type === 'multiple',
            available: true
        };
    }

    function filterProducts(products, excludeIds) {
        var seen = new Set();
        return products.filter(function (p) {
            if (!p) return false;
            if (excludeIds.has(p.id)) return false;
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
        });
    }

    // Ordena produtos: disponíveis primeiro; critério secundário configurável
    // sort: 'most_sold' | 'price_asc' | 'price_desc'
    function applySort(products, sort) {
        return products.slice().sort(function (a, b) {
            if (a.available !== b.available) return a.available ? -1 : 1;
            if (sort === 'price_asc')  return (a.price || 0) - (b.price || 0);
            if (sort === 'price_desc') return (b.price || 0) - (a.price || 0);
            return (b.unitsSold || 0) - (a.unitsSold || 0); // 'most_sold' (padrão)
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // DATA LAYER — fetch helpers (todas retornam Promise)
    // ══════════════════════════════════════════════════════════════════════════

    function fetchProductInfo(productId) {
        return fetch('/_search?an=' + window.LOJA_ID + '&filters=product_ids:' + encodeURIComponent(productId))
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data || !data.products || !data.products[0]) return null;
                return normalizeSearchProduct(data.products[0]);
            })
            .catch(function () { return null; });
    }

    function fetchCategoryProducts(categoryId) {
        return fetch('/_search?an=' + window.LOJA_ID + '&filter=is_active:true;is_searchable:true;is_available:true;category_ids:' + encodeURIComponent(categoryId) + '&sort=units_sold:desc')
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data || !Array.isArray(data.products)) return [];
                return applySort(data.products.map(normalizeSearchProduct).filter(Boolean), 'most_sold');
            })
            .catch(function () { return []; });
    }

    function fetchCompraJunto(productId) {
        return fetch('/compre_junto/' + encodeURIComponent(productId))
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data || !data.data || !data.data.products) return [];
                var products = data.data.products
                    .map(function (item) { return item.product; })
                    .map(normalizeCompraJuntoProduct)
                    .filter(Boolean);
                return applySort(products, 'most_sold');
            })
            .catch(function () { return []; });
    }

    // Busca múltiplos IDs via _search (um por vez, pois a API aceita 1 ID).
    // Preserva a ordem de declaração: fixedProductIds mantêm sua sequência original.
    function fetchProductsByIds(ids) {
        var promises = ids.map(function (id) { return fetchProductInfo(id); });
        return Promise.all(promises).then(function (results) {
            return results.filter(Boolean);
        });
    }

    // Busca produtos por uma única palavra-chave via /_search?q=
    function fetchKeywordsProducts(parameter) {
        if (!parameter) return Promise.resolve([]);
        return fetch('/_search?an=' + window.LOJA_ID + '&q=' + encodeURIComponent(parameter) + '&filter=is_active:true;is_available:true')
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data || !Array.isArray(data.products)) return [];
                return data.products.map(normalizeSearchProduct).filter(Boolean);
            })
            .catch(function () { return []; });
    }

    // Busca produtos por múltiplas palavras-chave: cada termo é buscado separadamente
    // e os resultados são mesclados (deduplicados), preservando a ordem de aparição.
    // Aceita string simples ou array de strings.
    function fetchMultiKeywordsProducts(parameterOrArray) {
        var terms = Array.isArray(parameterOrArray)
            ? parameterOrArray.filter(Boolean)
            : (parameterOrArray ? [String(parameterOrArray)] : []);
        if (terms.length === 0) return Promise.resolve([]);
        return Promise.all(terms.map(fetchKeywordsProducts))
            .then(function (results) {
                var merged = [].concat.apply([], results);
                // Deduplica preservando a primeira ocorrência de cada ID
                var seen = new Set();
                return merged.filter(function (p) {
                    if (!p || seen.has(p.id)) return false;
                    seen.add(p.id);
                    return true;
                });
            });
    }

    // Extrai a categoria principal de um produto via _search
    function fetchProductMainCategory(productId) {
        return fetch('/_search?an=' + window.LOJA_ID + '&filters=product_ids:' + encodeURIComponent(productId))
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                var raw = data && data.products && data.products[0];
                if (!raw) return null;
                var catId = (raw.main_category && raw.main_category.id) || null;
                if (!catId && Array.isArray(raw.category_ids) && raw.category_ids.length > 0) {
                    catId = raw.category_ids[0];
                }
                return catId || null;
            })
            .catch(function () { return null; });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // FETCH DINÂMICO — resolve produtos de acordo com source e contexto
    // ══════════════════════════════════════════════════════════════════════════

    function fetchDynamicProducts(sectionCfg, contextData) {
        var source      = sectionCfg.source || 'compre_junto';
        var context     = contextData.context;
        var productId   = contextData.productId;
        var cartIdArray = contextData.cartIdArray;

        // 'fixed' é alias retrocompatível de 'none'
        if (source === 'fixed' || source === 'none') {
            return Promise.resolve([]);
        }

        if (source === 'category') {
            return fetchCategoryProducts(sectionCfg.categoryId || '');
        }

        if (source === 'keywords') {
            return fetchMultiKeywordsProducts(sectionCfg.parameter || []).then(function (products) {
                return applySort(products, sectionCfg.sort || 'most_sold');
            });
        }

        if (source === 'product_map') {
            var map = sectionCfg.productMap || {};
            var mappedIds = [];
            cartIdArray.forEach(function (cartId) {
                if (map[cartId]) {
                    mappedIds = mappedIds.concat(map[cartId].map(String));
                }
            });
            mappedIds = mappedIds.filter(function (id, i, arr) { return arr.indexOf(id) === i; });
            return fetchProductsByIds(mappedIds).then(function (products) {
                return applySort(products, sectionCfg.sort || 'most_sold');
            });
        }

        if (source === 'lowest_related') {
            // Extrai todas as categorias dos produtos no carrinho e retorna todos os relacionados.
            // resolveProducts aplicará o sort configurado e limitará a maxProducts.
            if (cartIdArray.length === 0) return Promise.resolve([]);
            return Promise.all(cartIdArray.map(fetchProductMainCategory))
                .then(function (catIds) {
                    var uniqueCatIds = catIds.filter(function (id, i, arr) {
                        return id && arr.indexOf(id) === i;
                    });
                    if (uniqueCatIds.length === 0) return [];
                    return Promise.all(uniqueCatIds.map(fetchCategoryProducts))
                        .then(function (results) {
                            return [].concat.apply([], results);
                        });
                });
        }

        // 'compre_junto' — comportamento adaptado ao contexto
        if (source === 'compre_junto') {
            var refIds = (context === 'product' && productId) ? [productId] : cartIdArray;
            if (refIds.length === 0) return Promise.resolve([]);
            var max = sectionCfg.maxProducts || 6;
            return Promise.all(refIds.map(fetchCompraJunto))
                .then(function (results) {
                    var merged = [].concat.apply([], results);
                    // Remove produto da página atual (contexto de produto)
                    if (context === 'product' && productId) {
                        merged = merged.filter(function (p) { return p.id !== productId; });
                    }
                    var cjFiltered = filterProducts(merged, contextData.cartIds);
                    // Se já tem itens suficientes, retorna direto
                    if (cjFiltered.length >= max) return cjFiltered;
                    // Fallback: complementa com produtos da categoria dos itens de referência
                    var cjIds = new Set(cjFiltered.map(function (p) { return p.id; }));
                    return Promise.all(refIds.map(fetchProductMainCategory))
                        .then(function (catIds) {
                            var uniqueCatIds = catIds.filter(function (id, i, arr) {
                                return id && arr.indexOf(id) === i;
                            });
                            if (uniqueCatIds.length === 0) return cjFiltered;
                            return Promise.all(uniqueCatIds.map(fetchCategoryProducts))
                                .then(function (catResults) {
                                    var excludeForCat = new Set(contextData.cartIds);
                                    cjIds.forEach(function (id) { excludeForCat.add(id); });
                                    if (context === 'product' && productId) {
                                        excludeForCat.add(productId);
                                    }
                                    var catFiltered = filterProducts(
                                        [].concat.apply([], catResults),
                                        excludeForCat
                                    );
                                    // compre_junto sempre primeiro, categoria completa o restante
                                    return cjFiltered.concat(catFiltered);
                                });
                        });
                });
        }

        return Promise.resolve([]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // RESOLVE PRODUCTS — fixos primeiro + dinâmicos sorted + slice
    // ══════════════════════════════════════════════════════════════════════════

    function resolveProducts(sectionCfg, contextData, excludeIds) {
        var fixedIds = (sectionCfg.fixedProductIds || []).map(String);
        var sort     = sectionCfg.sort || 'most_sold';
        var max      = sectionCfg.maxProducts || 6;

        return Promise.all([
            fixedIds.length > 0 ? fetchProductsByIds(fixedIds) : Promise.resolve([]),
            fetchDynamicProducts(sectionCfg, contextData)
        ]).then(function (results) {
            var fixedRaw   = results[0];
            var dynamicRaw = results[1];

            // Filtra excluídos (produto atual, itens do carrinho)
            var fixedFiltered = fixedRaw.filter(function (p) {
                return p && !excludeIds.has(p.id);
            });
            var dynamicFiltered = filterProducts(dynamicRaw, excludeIds);

            // Remove dos dinâmicos os que já estão nos fixos
            var fixedSet = new Set(fixedFiltered.map(function (p) { return p.id; }));
            dynamicFiltered = dynamicFiltered.filter(function (p) { return !fixedSet.has(p.id); });

            // Fixos mantêm ordem de declaração; dinâmicos recebem sort configurável
            dynamicFiltered = applySort(dynamicFiltered, sort);

            return fixedFiltered.concat(dynamicFiltered).slice(0, max);
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SLIDER
    // ══════════════════════════════════════════════════════════════════════════

    function createSlider(containerEl) {
        var track = containerEl.querySelector('.ucs-track');
        var btnPrev = containerEl.querySelector('.ucs-arrow-prev');
        var btnNext = containerEl.querySelector('.ucs-arrow-next');
        var slides = Array.from(track.querySelectorAll('.ucs-slide'));
        var total = slides.length;
        var currentIndex = 0;
        var touchStartX = 0;
        var touchEndX = 0;
        var isDragging = false;
        var dragStartX = 0;
        var spv = parseInt(containerEl.getAttribute('data-ucs-spv'), 10) || 3;

        function getVisible() {
            var w = window.innerWidth;
            if (w <= 480) return Math.min(2, spv);
            if (w <= 768) return Math.min(2, spv);
            return spv;
        }

        // Aplica largura calculada a cada slide com base em slidesPerView
        function applySlideWidths() {
            var vis = getVisible();
            var gap = 16;
            var basis = 'calc(100% / ' + vis + ' - ' + (gap * (vis - 1) / vis).toFixed(4) + 'px)';
            slides.forEach(function (slide) {
                slide.style.flex = '0 0 ' + basis;
            });
        }
        applySlideWidths();

        function updateArrows() {
            if (!btnPrev || !btnNext) return;
            var vis = getVisible();
            btnPrev.disabled = currentIndex <= 0;
            btnPrev.setAttribute('aria-disabled', currentIndex <= 0 ? 'true' : 'false');
            btnNext.disabled = currentIndex >= total - vis;
            btnNext.setAttribute('aria-disabled', currentIndex >= total - vis ? 'true' : 'false');
        }

        function goTo(index) {
            var vis = getVisible();
            var maxIndex = Math.max(0, total - vis);
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            var slideWidth = slides[0] ? (slides[0].getBoundingClientRect().width + 16) : 0;
            track.style.transform = 'translateX(-' + (currentIndex * slideWidth) + 'px)';
            updateArrows();
        }

        if (btnPrev) {
            btnPrev.addEventListener('mousedown', function (e) { e.stopPropagation(); });
            btnPrev.addEventListener('click', function (e) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
                goTo(currentIndex - 1);
            });
        }
        if (btnNext) {
            btnNext.addEventListener('mousedown', function (e) { e.stopPropagation(); });
            btnNext.addEventListener('click', function (e) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
                goTo(currentIndex + 1);
            });
        }

        // Touch support
        track.addEventListener('touchstart', function (e) {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        track.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].clientX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 40) {
                goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
            }
        }, { passive: true });

        // Mouse drag
        track.addEventListener('mousedown', function (e) {
            isDragging = true;
            dragStartX = e.clientX;
            track.style.cursor = 'grabbing';
        });

        document.addEventListener('mouseup', function (e) {
            if (!isDragging) return;
            isDragging = false;
            track.style.cursor = '';
            var diff = dragStartX - e.clientX;
            if (Math.abs(diff) > 40) {
                goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
            }
        });

        window.addEventListener('resize', function () {
            applySlideWidths();
            goTo(currentIndex);
        });

        goTo(0);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CARD RENDER
    // ══════════════════════════════════════════════════════════════════════════

    // Layout de lista (página de produto)
    function renderListItem(product) {
        var imageHtml = product.image
            ? '<img src="'+ window.MEDIA_URL + "500x500" + escHtml(product.image) + '" alt="' + escHtml(product.name) + '" loading="lazy">'
            : '';

        var priceOldHtml = (!product.isMultiple && product.priceOld)
            ? '<span class="ucs-list-price-old">' + escHtml(formatPrice(product.priceOld)) + '</span>'
            : '';

        var priceFromHtml = product.isMultiple
            ? '<span class="ucs-list-price-from">a partir de </span>'
            : '';

        return '<div class="ucs-list-item">' +
            '<a class="ucs-list-img-wrap" href="' + escHtml(product.url) + '" tabindex="-1" aria-hidden="true">' + imageHtml + '</a>' +
            '<div class="ucs-list-info">' +
                '<a class="ucs-list-name" href="' + escHtml(product.url) + '">' + escHtml(product.name) + '</a>' +
                '<div>' +
                    priceFromHtml +
                    '<span class="ucs-list-price">' + escHtml(formatPrice(product.price)) + '</span>' +
                    priceOldHtml +
                '</div>' +
            '</div>' +
            '<button class="ucs-btn ucs-btn-outline" data-ucs-add data-product-id="' + escHtml(product.id) + '">+ Adicionar</button>' +
        '</div>';
    }

    function renderCard(product) {
        var imageHtml = product.image
            ? '<img src="'+ window.MEDIA_URL + "1000x1000" + escHtml(product.image) + '" alt="' + escHtml(product.name) + '" loading="lazy">'
            : '<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px;">Sem imagem</span>';

        var priceOldHtml = (!product.isMultiple && product.priceOld)
            ? '<span class="ucs-price-old">' + escHtml(formatPrice(product.priceOld)) + '</span>'
            : '';

        var priceFromHtml = product.isMultiple
            ? '<span class="ucs-price-from">a partir de </span>'
            : '';

        return '<div class="ucs-card">' +
            '<a class="ucs-card-img-wrap" href="' + escHtml(product.url) + '" tabindex="-1" aria-hidden="true">' + imageHtml + '</a>' +
            '<div class="ucs-card-body">' +
                '<a class="ucs-card-name" href="' + escHtml(product.url) + '">' + escHtml(product.name) + '</a>' +
                '<div class="ucs-card-prices">' +
                    priceFromHtml +
                    '<span class="ucs-price">' + escHtml(formatPrice(product.price)) + '</span>' +
                    priceOldHtml +
                '</div>' +
                '<button class="ucs-btn" data-ucs-add data-product-id="' + escHtml(product.id) + '">' +
                    'Adicionar' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ADD TO CART
    // ══════════════════════════════════════════════════════════════════════════

    function addToCart(skuId, buttonEl, onAddToCart, source) {
        if (!buttonEl) return;
        buttonEl.disabled = true;
        buttonEl.classList.add('ucs-btn-loading');
        buttonEl.textContent = 'Adicionando...';

        var url = '/carrinho/produto/' + encodeURIComponent(skuId) + '/adicionar/1';
        if (source) url += '?utm_source=' + encodeURIComponent(source);

        $.get(url, function (response) {
            if (response && response.status === 'sucesso') {
                if (typeof sendMetrics === 'function') {
                    try {
                        var MS = {
                            id: response.carrinho_id,
                            origin: source || 'unknown',
                            items: [{
                                item_id: skuId,
                                quantity: (response.produto && response.produto.quantidade ? response.produto.quantidade : 0)
                            }]
                        };
                        var L = sendMetrics({ type: 'event', name: 'add_to_cart', data: MS });
                        $(document).trigger('li_add_to_cart', [L, MS]);
                    } catch (e) { /* métricas não disponíveis */ }
                }

                if (typeof onAddToCart === 'function') {
                    try { onAddToCart(response, skuId); } catch (e) { /* callback error */ }
                }

                buttonEl.classList.remove('ucs-btn-loading');
                buttonEl.classList.add('ucs-btn-success');
                buttonEl.textContent = '✓ Adicionado';
            } else {
                buttonEl.classList.remove('ucs-btn-loading');
                buttonEl.classList.add('ucs-btn-error');
                buttonEl.textContent = 'Erro. Tente novamente';
                buttonEl.disabled = false;
                setTimeout(function () {
                    buttonEl.classList.remove('ucs-btn-error');
                    buttonEl.textContent = 'Adicionar';
                }, 2500);
            }
        }).fail(function () {
            buttonEl.classList.remove('ucs-btn-loading');
            buttonEl.classList.add('ucs-btn-error');
            buttonEl.textContent = 'Erro. Tente novamente';
            buttonEl.disabled = false;
            setTimeout(function () {
                buttonEl.classList.remove('ucs-btn-error');
                buttonEl.textContent = 'Adicionar';
            }, 2500);
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SKU MODAL
    // ══════════════════════════════════════════════════════════════════════════

    var _modalCallback = null;

    function injectModal() {
        if (document.getElementById('ucsSKUModal')) return;
        document.body.insertAdjacentHTML('beforeend', MODAL_TEMPLATE);

        var modal = document.getElementById('ucsSKUModal');
        var closeBtn = document.getElementById('ucsModalClose');

        closeBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeModal();
        });
    }

    function openSkuModal(product, onSkuSelected) {
        injectModal();
        _modalCallback = onSkuSelected;

        var modal = document.getElementById('ucsSKUModal');
        var nameEl = document.getElementById('ucsModalProductName');
        var labelEl = document.getElementById('ucsModalLabel');
        var optionsEl = document.getElementById('ucsModalOptions');

        nameEl.textContent = product.name;

        // Descobrir o label da grade de variação
        var gridLabel = 'Selecione uma opção';
        if (product.skus && product.skus[0] && product.skus[0].variations && product.skus[0].variations.length > 0) {
            gridLabel = product.skus[0].variations[0].grid
                ? product.skus[0].variations[0].grid.value_for_display
                : gridLabel;
        }
        labelEl.textContent = gridLabel;

        var cartIds = new Set();
        try {
            var _mc = sessionStorage.getItem('carrinho_minicart');
            if (_mc) {
                var _mcp = JSON.parse(_mc);
                ((_mcp && _mcp.carrinho && _mcp.carrinho.items) || []).forEach(function (item) {
                    if (item.parentId) cartIds.add(String(item.parentId));
                    else if (item.id) cartIds.add(String(item.id));
                });
            }
        } catch (e) {}
        var html = '';
        var sortedSkus = (product.skus || []).slice().sort(function (a, b) {
            return (a.available === false ? 1 : 0) - (b.available === false ? 1 : 0);
        });
        sortedSkus.forEach(function (sku) {
            var unavailable = !sku.available;
            var label = sku.varLabel || (sku.variations[0].value.name);
            var priceHtml = escHtml(formatPrice(sku.price));
            var badgesHtml = unavailable
                ? '<span class="ucs-sku-option-badge">Indisponível</span>'
                : '';
              badgesHtml += cartIds.has(sku.id) ? '<span class="ucs-sku-option-badge">No carrinho</span>' : '';
            html += '<button class="ucs-sku-option" data-sku-id="' + escHtml(sku.id) + '" data-sku-price="' + escHtml(String(sku.price)) + '"' +
                (unavailable ? ' data-unavailable="true" disabled' : '') + '>' +
                '<span class="ucs-sku-option-label">' + escHtml(label) + badgesHtml + '</span>' +
                '<span class="ucs-sku-option-price">' + priceHtml + '</span>' +
                '</button>';
        });
        optionsEl.innerHTML = html;

        optionsEl.querySelectorAll('.ucs-sku-option').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var skuId = btn.getAttribute('data-sku-id');
                var skuPrice = parseFloat(btn.getAttribute('data-sku-price')) || 0;
                var cb = _modalCallback;
                closeModal();
                if (typeof cb === 'function') cb(skuId, skuPrice);
            });
        });

        modal.classList.add('ucs-modal-open');
        modal.focus();
    }

    function closeModal() {
        var modal = document.getElementById('ucsSKUModal');
        if (modal) modal.classList.remove('ucs-modal-open');
        _modalCallback = null;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BOTÃO "ADICIONAR" — lida com single/multi SKU
    // ══════════════════════════════════════════════════════════════════════════

    function handleAddClick(product, buttonEl, onAddToCart, source) {
        if (!product) return;

        // Verificar se produto está no carrinho agora (pode ter sido adicionado durante a sessão)
        var cartIds = new Set();
        try {
            var _mc = sessionStorage.getItem('carrinho_minicart');
            if (_mc) {
                var _mcp = JSON.parse(_mc);
                ((_mcp && _mcp.carrinho && _mcp.carrinho.items) || []).forEach(function (item) {
                    if (item.parentId) cartIds.add(String(item.parentId));
                    else if (item.id) cartIds.add(String(item.id));
                });
            }
        } catch (e) {}
        if (cartIds.has(product.id)) {
            buttonEl.disabled = true;
            buttonEl.classList.add('ucs-btn-success');
            buttonEl.textContent = '✓ No carrinho';
            return;
        }

        if (!product.isMultiple || !product.skus || product.skus.length <= 1) {
            // Single SKU — adicionar direto
            var skuId = product.skus && product.skus[0] ? product.skus[0].id : product.id;
            addToCart(skuId, buttonEl, onAddToCart, source);
        } else {
            // Multi SKU — abrir modal
            openSkuModal(product, function (skuId) {
                addToCart(skuId, buttonEl, onAddToCart, source);
            });
        }
    }

    // Associa eventos de clique em botões "Adicionar" de um container
    function bindAddButtons(containerEl, products, onAddToCart, source) {
        containerEl.querySelectorAll('[data-ucs-add]').forEach(function (btn) {
            var productId = btn.getAttribute('data-product-id');
            var product = products.find(function (p) { return p.id === String(productId); });
            if (!product) return;

            // Impede que o mousedown alcance o track do slider (evita ativar drag ao clicar no botão)
            btn.addEventListener('mousedown', function (e) {
                e.stopPropagation();
            });

            // Listener nativo: stopPropagation nativo bloqueia tanto handlers jQuery delegados
            // no tema quanto listeners nativos em ancestrais (ex: popups do tema)
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
                handleAddClick(product, btn, onAddToCart, source);
            });
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // INJEÇÃO DE ESTILOS
    // ══════════════════════════════════════════════════════════════════════════

    function injectStyles() {
        if (!document.getElementById('ucs-styles')) {
            document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BUILD CONTEXT DATA
    // ══════════════════════════════════════════════════════════════════════════

    function buildContextData(context, minicartItems) {
        var cartIds = new Set();
        if (minicartItems && minicartItems.length > 0) {
            minicartItems.forEach(function (item) {
                if (item.parentId) cartIds.add(String(item.parentId));
                else if (item.id) cartIds.add(String(item.id));
            });
        }
        // Fallback DOM para carrinho e checkout quando minicart não retornar itens
        if (cartIds.size === 0 && context !== 'product') {
            document.querySelectorAll('[data-produto-id]').forEach(function (el) {
                var id = el.getAttribute('data-produto-id');
                if (id) cartIds.add(String(id));
            });
        }
        return {
            context:     context,
            productId:   window.PRODUTO_ID ? String(window.PRODUTO_ID) : null,
            cartIds:     cartIds,
            cartIdArray: Array.from(cartIds)
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BUILD SECTION HTML — renderiza o layout correto para cada contexto
    // ══════════════════════════════════════════════════════════════════════════

    function buildSectionHTML(sectionCfg, products, sectionDomId) {
        var layout  = sectionCfg.layout || 'slider';
        var title   = sectionCfg.title  || '';
        var innerHtml = '';

        if (layout === 'list') {
            innerHtml = '<div class="ucs-product-list">' +
                products.map(renderListItem).join('') +
            '</div>';

        } else if (layout === 'grid') {
            var cols = sectionCfg.cardsPerRow || 3;
            innerHtml = '<div class="ucs-product-grid" style="grid-template-columns: repeat(' + cols + ', 1fr)">' +
                products.map(renderCard).join('') +
            '</div>';

        } else if (layout === 'single') {
            var p = products[0];
            var imgSrc = p.image
                ? '<img class="ucs-checkout-img" src="' + window.MEDIA_URL + '1000x1000' + escHtml(p.image) + '" alt="' + escHtml(p.name) + '" loading="lazy">'
                : '<div class="ucs-checkout-img" style="background:#f3f4f6;border-radius:8px;"></div>';
            var priceFromHtml = p.isMultiple ? '<span class="ucs-price-from">a partir de </span>' : '';
            var priceOldHtml  = (!p.isMultiple && p.priceOld)
                ? ' <span class="ucs-price-old">' + escHtml(formatPrice(p.priceOld)) + '</span>'
                : '';
            innerHtml =
                '<div class="ucs-checkout-card">' +
                    imgSrc +
                    '<div class="ucs-checkout-info">' +
                        '<p class="ucs-checkout-name">' + escHtml(p.name) + '</p>' +
                        '<p class="ucs-checkout-price">' + priceFromHtml + escHtml(formatPrice(p.price)) + priceOldHtml + '</p>' +
                        '<button class="ucs-btn" data-ucs-add data-product-id="' + escHtml(p.id) + '">Adicionar</button>' +
                    '</div>' +
                '</div>';

        } else {
            // 'slider' (padrão)
            var spv = sectionCfg.slidesPerView || 3;
            var slideClass = spv === 1 ? 'ucs-slide ucs-slide-row' : 'ucs-slide';
            var slidesHtml = products.map(function (prod) {
                return '<div class="' + slideClass + '">' + renderCard(prod) + '</div>';
            }).join('');
            innerHtml =
                '<div class="ucs-slider-wrap" data-ucs-spv="' + spv + '">' +
                    '<button class="ucs-arrow ucs-arrow-prev" aria-label="Anterior">' +
                        '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>' +
                    '</button>' +
                    '<div class="ucs-slider"><div class="ucs-track">' + slidesHtml + '</div></div>' +
                    '<button class="ucs-arrow ucs-arrow-next" aria-label="Próximo">' +
                        '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>' +
                    '</button>' +
                '</div>';
        }

        return '<div id="' + escHtml(sectionDomId) + '" class="ucs-section' +
            (layout === 'slider' ? ' ucs-cart-section' : '') + '">' +
            '<p class="ucs-section-title">' + escHtml(title) + '</p>' +
            innerHtml +
        '</div>';
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PROCESS SECTION — ponto único de entrada: resolve → renderiza → insere
    // ══════════════════════════════════════════════════════════════════════════

    function processSection(sectionCfg, contextData, sectionDomId, excludeIds) {
        return resolveProducts(sectionCfg, contextData, excludeIds).then(function (products) {
            if (!products || products.length === 0) return;

            var sectionHtml = buildSectionHTML(sectionCfg, products, sectionDomId);

            // Remove seção anterior se já existir (evita duplicatas no reinit)
            var existing = document.getElementById(sectionDomId);
            if (existing) existing.remove();

            var insertSelector = sectionCfg.insertSelector;
            var insertMethod   = sectionCfg.insertMethod || 'beforeend';
            var target = document.querySelector(insertSelector);

            if (!target) {
                if (contextData.context === 'product') {
                    document.body.insertAdjacentHTML('beforeend', sectionHtml);
                } else {
                    return;
                }
            } else {
                target.insertAdjacentHTML(insertMethod, sectionHtml);
            }

            var sectionEl = document.getElementById(sectionDomId);
            if (!sectionEl) return;

            var layout = sectionCfg.layout || 'slider';
            if (layout === 'slider') {
                createSlider(sectionEl.querySelector('.ucs-slider-wrap'));
            }

            var utmSource = sectionCfg.id || contextData.context;
            bindAddButtons(sectionEl, products, sectionCfg.onAddToCart, utmSource);
        });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // INITS (wrappers finos sobre processSection)
    // ══════════════════════════════════════════════════════════════════════════

    function initProductPage(contextData) {
        var cfg = CONFIG.productPage;
        if (!cfg.active) return Promise.resolve();
        if (!contextData.productId) return Promise.resolve();

        var excludeIds = new Set(contextData.cartIds);
        excludeIds.add(contextData.productId);
        return processSection(cfg, contextData, 'ucsProductSection', excludeIds);
    }

    function initCart(contextData) {
        var cfg = CONFIG.cart;
        if (!cfg.active) return Promise.resolve();
        if (!cfg.sections || cfg.sections.length === 0) return Promise.resolve();

        var excludeIds = new Set(contextData.cartIds);
        var promises = cfg.sections.map(function (section) {
            return processSection(section, contextData, 'ucs-section-' + section.id, excludeIds);
        });
        return Promise.all(promises);
    }

    function initCheckout(contextData) {
        var cfg = CONFIG.checkout;
        if (!cfg.active) return Promise.resolve();
        if (contextData.cartIds.size === 0 && cfg.source !== 'none' && cfg.source !== 'fixed') {
            return Promise.resolve();
        }

        // layout 'single' sempre exibe 1 produto; slider respeita maxProducts do cfg
        var checkoutCfg = cfg.layout === 'single'
            ? Object.assign({}, cfg, { maxProducts: 1 })
            : cfg;
        var excludeIds = new Set(contextData.cartIds);
        return processSection(checkoutCfg, contextData, 'ucsCheckoutSection', excludeIds);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // DETECÇÃO DE CONTEXTO E INICIALIZAÇÃO
    // ══════════════════════════════════════════════════════════════════════════

    function detectContext() {
        if (document.querySelector('.pagina-produto')) return 'product';
        if (document.querySelector('.pagina-carrinho.carrinho-checkout')) return 'checkout';
        if (document.querySelector('.pagina-carrinho')) return 'cart';
        return null;
    }

    // ======================================================
    // CLASSE PRINCIPAL
    // ======================================================
    class UpsellCrossSell {
        constructor() {
            this.context = null;
            this.init();
        }

        init() {
            if (!CONFIG.active) return;

            this.context = detectContext();
            if (!this.context) return;

            injectStyles();

            var self = this;
            fetchMinicartItems().then(function (minicartItems) {
                var contextData = buildContextData(self.context, minicartItems);
                if (self.context === 'product') {
                    initProductPage(contextData);
                } else if (self.context === 'cart') {
                    initCart(contextData);
                } else if (self.context === 'checkout') {
                    initCheckout(contextData);
                }
            });
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        reinit() {
            this.destroy();
            injectStyles();
            this.context = detectContext();
            if (!this.context) return;

            var self = this;
            fetchMinicartItems().then(function (minicartItems) {
                var contextData = buildContextData(self.context, minicartItems);
                if (self.context === 'product') {
                    initProductPage(contextData);
                } else if (self.context === 'cart') {
                    initCart(contextData);
                } else if (self.context === 'checkout') {
                    initCheckout(contextData);
                }
            });
        }

        destroy() {
            ['ucsProductSection', 'ucsCheckoutSection'].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) el.remove();
            });
            document.querySelectorAll('.ucs-cart-section').forEach(function (el) {
                el.remove();
            });
            var modal = document.getElementById('ucsSKUModal');
            if (modal) modal.remove();
            var styles = document.getElementById('ucs-styles');
            if (styles) styles.remove();
        }
    }

    // ======================================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ======================================================
    function initUpsellCrossSell() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                window.UpsellCrossSell = new UpsellCrossSell();
            });
        } else {
            window.UpsellCrossSell = new UpsellCrossSell();
        }
    }

    initUpsellCrossSell();

})();