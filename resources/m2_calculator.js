/**
 * M2 Calculator - Calculadora de vendas por metro quadrado
 * Calcula e define a quantidade correta com base na área (largura × altura) informada pelo cliente
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.M2CalculatorConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {

        // Textos da interface
        title: "Calcule sua área",
        widthLabel: "Largura (m)",
        heightLabel: "Altura (m)",
        widthPlaceholder: "Ex: 1.50",
        heightPlaceholder: "Ex: 2.00",
        buttonText: "Confirmar medidas",
        areaLabel: "Área calculada:",
        m2PriceLabel: "Valor do m²:",
        unitPriceLabel: "Preço unitário:",
        quantityLabel: "Quantidade de peças:",
        totalLabel: "Total estimado:",
        errorInvalidWidth: "Informe uma largura válida.",
        errorInvalidHeight: "Informe uma altura válida.",
        errorMinWidth: "Largura mínima permitida:",
        errorMaxWidth: "Largura máxima permitida:",
        errorMinHeight: "Altura mínima permitida:",
        errorMaxHeight: "Altura máxima permitida:",

        // Divisão em painéis quando as medidas excedem os limites máximos.
        // Quando ativado (padrão), medidas acima do máximo são divididas automaticamente
        // em painéis que respeitam os limites configurados.
        panelSplitEnabled: true,
        panelListTitle: 'Painéis necessários:',
        panelItemLabel: 'Painel',
        panelTotalLabel: 'Total:',

        // Callback chamado no modo de painéis. Recebe um array de objetos
        // { index, width, height, quantity } representando cada painel.
        onPanelsCalculated: null,

        // Callback chamado logo após o plugin ser inicializado na página.
        // Use para ajustes de layout, ocultar elementos, etc.
        //onLoad: null,
        onLoad: function(plugin) {
            $('.resumo-flutuante').hide();
            $('.principal .qtde-adicionar-carrinho').addClass('hide');
            $(`.principal .acoes-produto`).addClass(`notCalculated`)
        },

        // Mensagem do tooltip exibido no botão de compra enquanto as medidas
        // ainda não foram confirmadas (classe .notCalculated ativa).
        notCalculatedMessage: 'Confirme as medidas antes de finalizar a compra.',

        // Textos exibidos no carrinho (checkout_measures)
        checkoutLabel:       'Medidas confirmadas:',
        checkoutWidthLabel:  'Largura',
        checkoutHeightLabel: 'Altura',
        checkoutPanelLabel:  'Painel',

        // Callback global chamado quando a quantidade é calculada e confirmada.
        // Recebe a quantidade (número inteiro) como único argumento.
        onQuantityCalculated: function (quantity) {

            var $input = $('.acoes-produto').find('.qtde-carrinho');
            if ($input.length) {
                $input.val(quantity).trigger('change');
            }
        },

        // Seletor padrão para obter o preço unitário do produto
        priceSelector: '.principal [data-sell-price]',
        priceAttribute: 'data-sell-price',

        // Seletor CSS do elemento APÓS o qual o widget será inserido.
        // Se não encontrado, o widget é inserido no final do <body>.
        insertAfterSelector: '',

        // Cores e estilos
        colors: {
            primary: "#3b82f6",
            primaryHover: "#2563eb",
            background: "#f9fafb",
            border: "#e5e7eb",
            text: "#1f2937",
            label: "#6b7280",
            error: "#ef4444",
            total: "#1f2937",
        },

        // Lista de configurações por produto.
        // O plugin avalia cada item em ordem e ativa o primeiro cuja condição for verdadeira.
        products: [
            /*
            {
                // Condição JavaScript avaliada em tempo de execução.
                // Ex: "window.PRODUTO_ID == 399627934"
                // Deixe vazio ou omita para ativar em qualquer página.
                condition: "window.PRODUTO_ID == 399627934",

                // Relação de unidades por m².
                // Ex: 1000 significa que 1 m² equivale a 1000 unidades.
                // A fórmula padrão é: Math.ceil(largura × altura × quantityRatio)
                quantityRatio: 1000,

                // Limites de largura e altura (em metros)
                minWidth: 0.10,
                maxWidth: 10.0,
                minHeight: 0.10,
                maxHeight: 10.0,

                // Step dos inputs (incremento/decremento via teclado/setas).
                // Aceita qualquer número decimal. Ex: 0.01, 0.05, 0.10, 1
                // Se omitido, o padrão é 0.01.
                widthStep: 0.01,
                heightStep: 0.01,

                // Seletor de preço específico para este produto (opcional).
                // Se omitido, usa os valores de CONFIG.priceSelector / CONFIG.priceAttribute.
                // priceSelector: '.principal [data-sell-price]',
                // priceAttribute: 'data-sell-price',

                // Fórmula personalizada de quantidade (opcional).
                // Se definida, substitui o cálculo padrão com quantityRatio.
                // quantityFormula: function(width, height) { return Math.ceil(width * height * 1000); },
            }
            */
        ],
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.M2CalculatorConfig && typeof window.M2CalculatorConfig === 'object') {
        Object.assign(CONFIG, window.M2CalculatorConfig);

        if (window.M2CalculatorConfig.colors && typeof window.M2CalculatorConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.M2CalculatorConfig.colors);
        }

        if (Array.isArray(window.M2CalculatorConfig.products)) {
            CONFIG.products = window.M2CalculatorConfig.products;
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    const CSS_STYLES = `
        <style id="m2-calculator-styles">
            .m2calc-container {
                background: ${CONFIG.colors.background};
                border: 1px solid ${CONFIG.colors.border};
                border-radius: 6px;
                padding: 10px;
                margin: 8px 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                box-sizing: border-box;
            }

            .m2calc-limits {
                font-size: 11px;
                color: ${CONFIG.colors.label};
                background: ${CONFIG.colors.primary}11;
                border: 1px solid ${CONFIG.colors.primary}33;
                border-radius: 4px;
                padding: 5px 8px;
                margin-bottom: 8px;
                line-height: 1.7;
            }

            .m2calc-limits strong {
                color: ${CONFIG.colors.text};
                font-weight: 600;
            }

            .m2calc-limits-row {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }

            .m2calc-title {
                font-size: 13px;
                font-weight: 600;
                color: ${CONFIG.colors.text};
                margin: 0 0 8px 0;
            }

            .m2calc-fields {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: flex-end;
                margin-bottom: 0;
            }

            .m2calc-field {
                flex: 1;
                min-width: 80px;
            }

            .m2calc-field label {
                display: block;
                font-size: 11px;
                font-weight: 600;
                color: ${CONFIG.colors.label};
                margin-bottom: 3px;
                text-transform: uppercase;
                letter-spacing: 0.04em;
            }

            .m2calc-field input[type="number"] {
                width: 100%;
                padding: 5px 8px;
                border: 1px solid ${CONFIG.colors.border};
                border-radius: 4px;
                font-size: 13px;
                color: ${CONFIG.colors.text};
                background: #ffffff;
                box-sizing: border-box;
                transition: border-color 0.15s, box-shadow 0.15s;
                outline: none;
                -moz-appearance: textfield;
            }

            .m2calc-field input[type="number"]::-webkit-outer-spin-button,
            .m2calc-field input[type="number"]::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            .m2calc-field input[type="number"]:focus {
                border-color: ${CONFIG.colors.primary};
                box-shadow: 0 0 0 2px ${CONFIG.colors.primary}28;
            }

            .m2calc-field input[type="number"].m2calc-input-error {
                border-color: ${CONFIG.colors.error};
            }

            .m2calc-error-msg {
                font-size: 10px;
                color: ${CONFIG.colors.error};
                margin-top: 2px;
                min-height: 13px;
                display: block;
            }

            .m2calc-summary {
                border-top: 1px solid ${CONFIG.colors.border};
                padding: 6px 0 0;
                margin: 6px 0;
                display: none;
            }

            .m2calc-summary.m2calc-visible {
                display: flex;
                width: 100%;
            }

            .m2calc-summary-row {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                font-size: 12px;
                color: ${CONFIG.colors.label};
                padding: 1px 0;
            }

            .m2calc-summary-row.m2calc-row-total {
                font-size: 13px;
                font-weight: 700;
                color: ${CONFIG.colors.total};
                border-top: 1px solid ${CONFIG.colors.border};
                margin-top: 4px;
                padding-top: 4px;
            }

            .m2calc-summary-val {
                font-weight: 600;
                color: ${CONFIG.colors.text};
            }

            .m2calc-summary-row.m2calc-row-total .m2calc-summary-val {
                color: ${CONFIG.colors.total};
            }

            .m2calc-btn {
                display: block;
                padding: 7px 12px;
                background: ${CONFIG.colors.primary};
                color: #ffffff;
                border: none;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s;
                white-space: nowrap;
                align-self: flex-end;
                flex-shrink: 0;
            }

            .m2calc-btn:hover {
                background: ${CONFIG.colors.primaryHover};
            }

            .m2calc-btn:active {
                opacity: 0.9;
            }

            .m2calc-panel-section {
                border-top: 1px solid ${CONFIG.colors.border};
                padding-top: 6px;
                margin-top: 4px;
                width:100%;
            }

            .m2calc-panel-title {
                font-size: 11px;
                font-weight: 700;
                color: ${CONFIG.colors.label};
                text-transform: uppercase;
                letter-spacing: 0.04em;
                margin: 0 0 4px 0;
            }

            .m2calc-panel-grid-info {
                font-size: 10px;
                font-weight: 400;
                text-transform: none;
                letter-spacing: 0;
                color: ${CONFIG.colors.label};
                opacity: 0.75;
            }

            .m2calc-panel-diagram {
                width: 100%;
                display: block;
                margin: 4px 0;
            }

            /* Tooltip no botão de compra quando medidas não confirmadas */
            .notCalculated .botao-comprar {
                position: relative;
                cursor: not-allowed !important;
                opacity: 0.6;
            }

            .notCalculated .botao-comprar::after {
                content: attr(data-m2calc-tip);
                position: absolute;
                bottom: calc(100% + 8px);
                left: 50%;
                transform: translateX(-50%);
                background: #1f2937;
                color: #fff;
                font-size: 12px;
                font-weight: 400;
                line-height: 1.4;
                white-space: normal;
                width: 200px;
                text-align: center;
                padding: 7px 10px;
                border-radius: 6px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s;
                z-index: 9999;
            }

            .notCalculated .botao-comprar::before {
                content: '';
                position: absolute;
                bottom: calc(100% + 3px);
                left: 50%;
                transform: translateX(-50%);
                border: 5px solid transparent;
                border-top-color: #1f2937;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s;
                z-index: 9999;
            }

            .notCalculated .botao-comprar:hover::after,
            .notCalculated .botao-comprar:hover::before {
                opacity: 1;
            }

            @media (max-width: 360px) {
                .m2calc-field {
                    min-width: 100%;
                }
                .m2calc-btn {
                    width: 100%;
                }
            }
        </style>
    `;

    const HTML_TEMPLATE = `
        <div id="m2-calculator-container" class="m2calc-container">
            <div class="m2calc-limits" id="m2calc-limits" style="display:none"></div>
            <p class="m2calc-title" id="m2calc-title"></p>
            <div class="m2calc-fields">
                <div class="m2calc-field">
                    <label id="m2calc-width-label" for="m2calc-width-input"></label>
                    <input type="number" id="m2calc-width-input" step="0.01" min="0" autocomplete="off" />
                    <span class="m2calc-error-msg" id="m2calc-width-error" aria-live="polite"></span>
                </div>
                <div class="m2calc-field">
                    <label id="m2calc-height-label" for="m2calc-height-input"></label>
                    <input type="number" id="m2calc-height-input" step="0.01" min="0" autocomplete="off" />
                    <span class="m2calc-error-msg" id="m2calc-height-error" aria-live="polite"></span>
                </div>
                <button class="m2calc-btn" id="m2calc-btn" type="button"></button>
            </div>
            <div class="m2calc-summary" id="m2calc-summary">
                <div class="m2calc-summary-row" id="m2calc-area-row">
                    <span id="m2calc-area-label"></span>
                    <span class="m2calc-summary-val" id="m2calc-area-value"></span>
                </div>
                <div class="m2calc-summary-row" id="m2calc-m2price-row">
                    <span id="m2calc-m2price-label"></span>
                    <span class="m2calc-summary-val" id="m2calc-m2price-value"></span>
                </div>
                <div class="m2calc-summary-row" id="m2calc-unit-price-row">
                    <span id="m2calc-unit-price-label"></span>
                    <span class="m2calc-summary-val" id="m2calc-unit-price-value"></span>
                </div>
                <div class="m2calc-summary-row" id="m2calc-quantity-row">
                    <span id="m2calc-quantity-label"></span>
                    <span class="m2calc-summary-val" id="m2calc-quantity-value"></span>
                </div>
                <div class="m2calc-summary-row m2calc-row-total" id="m2calc-total-row">
                    <span id="m2calc-total-label"></span>
                    <span class="m2calc-summary-val" id="m2calc-total-value"></span>
                </div>
                <div class="m2calc-panel-section" id="m2calc-panel-section" style="display:none">
                    <p class="m2calc-panel-title" id="m2calc-panel-title"></p>
                    <div id="m2calc-panel-items"></div>
                    <div class="m2calc-summary-row m2calc-row-total">
                        <span id="m2calc-panel-total-label"></span>
                        <span class="m2calc-summary-val" id="m2calc-panel-total-value"></span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class M2Calculator {
        constructor(productConfig) {
            this.productConfig = productConfig;
            this.calculatedQuantity = 0;
            this.panelMode = false;
            this.init();
        }

        init() {
            this.injectStyles();
            this.injectHTML();
            this.setupElements();
            this.setupEventListeners();
            if (typeof CONFIG.onLoad === 'function') {
                CONFIG.onLoad(this);
            }
        }

        injectStyles() {
            if (!document.getElementById('m2-calculator-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        injectHTML() {
            const existing = document.getElementById('m2-calculator-container');
            if (existing) existing.remove();

            const anchor = CONFIG.insertAfterSelector
                ? document.querySelector(CONFIG.insertAfterSelector)
                : null;

            if (anchor) {
                anchor.insertAdjacentHTML('afterend', HTML_TEMPLATE);
            } else {
                document.body.insertAdjacentHTML('beforeend', HTML_TEMPLATE);
            }
        }

        setupElements() {
            const pc = this.productConfig;

            this.container      = document.getElementById('m2-calculator-container');
            this.titleEl        = document.getElementById('m2calc-title');
            this.widthInput     = document.getElementById('m2calc-width-input');
            this.heightInput    = document.getElementById('m2calc-height-input');
            this.widthLabel     = document.getElementById('m2calc-width-label');
            this.heightLabel    = document.getElementById('m2calc-height-label');
            this.widthError     = document.getElementById('m2calc-width-error');
            this.heightError    = document.getElementById('m2calc-height-error');
            this.summary        = document.getElementById('m2calc-summary');
            this.areaRow        = document.getElementById('m2calc-area-row');
            this.areaLabel      = document.getElementById('m2calc-area-label');
            this.areaValue      = document.getElementById('m2calc-area-value');
            this.m2PriceRow     = document.getElementById('m2calc-m2price-row');
            this.m2PriceLabel   = document.getElementById('m2calc-m2price-label');
            this.m2PriceValue   = document.getElementById('m2calc-m2price-value');
            this.unitPriceRow   = document.getElementById('m2calc-unit-price-row');
            this.unitPriceLabel = document.getElementById('m2calc-unit-price-label');
            this.unitPriceValue = document.getElementById('m2calc-unit-price-value');
            this.quantityRow    = document.getElementById('m2calc-quantity-row');
            this.quantityLabel  = document.getElementById('m2calc-quantity-label');
            this.quantityValue  = document.getElementById('m2calc-quantity-value');
            this.totalRow       = document.getElementById('m2calc-total-row');
            this.totalLabel     = document.getElementById('m2calc-total-label');
            this.totalValue     = document.getElementById('m2calc-total-value');
            this.button         = document.getElementById('m2calc-btn');
            this.limitsEl       = document.getElementById('m2calc-limits');
            this.panelSection   = document.getElementById('m2calc-panel-section');
            this.panelTitle     = document.getElementById('m2calc-panel-title');
            this.panelItems     = document.getElementById('m2calc-panel-items');
            this.panelTotalLabel = document.getElementById('m2calc-panel-total-label');
            this.panelTotalValue = document.getElementById('m2calc-panel-total-value');

            // Textos
            this.titleEl.textContent        = CONFIG.title;
            this.widthLabel.textContent     = CONFIG.widthLabel;
            this.heightLabel.textContent    = CONFIG.heightLabel;
            this.widthInput.placeholder     = CONFIG.widthPlaceholder;
            this.heightInput.placeholder    = CONFIG.heightPlaceholder;
            this.button.textContent         = CONFIG.buttonText;
            this.areaLabel.textContent      = CONFIG.areaLabel;
            this.m2PriceLabel.textContent   = CONFIG.m2PriceLabel;
            this.unitPriceLabel.textContent = CONFIG.unitPriceLabel;
            this.quantityLabel.textContent  = CONFIG.quantityLabel;
            this.totalLabel.textContent     = CONFIG.totalLabel;
            this.panelTitle.textContent     = CONFIG.panelListTitle;
            this.panelTotalLabel.textContent = CONFIG.panelTotalLabel;

            // Limites e step
            if (pc.minWidth  != null) this.widthInput.min  = pc.minWidth;
            if (pc.maxWidth  != null) this.widthInput.max  = pc.maxWidth;
            if (pc.minHeight != null) this.heightInput.min = pc.minHeight;
            if (pc.maxHeight != null) this.heightInput.max = pc.maxHeight;
            if (pc.widthStep  != null) this.widthInput.step  = pc.widthStep;
            if (pc.heightStep != null) this.heightInput.step = pc.heightStep;

            // Exibe barra de medidas mínimas/máximas
            const hasW = pc.minWidth != null || pc.maxWidth != null;
            const hasH = pc.minHeight != null || pc.maxHeight != null;
            if (hasW || hasH) {
                const fmt = v => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
                let wParts = [], hParts = [];
                if (pc.minWidth  != null) wParts.push(`mín <strong>${fmt(pc.minWidth)} m</strong>`);
                if (pc.maxWidth  != null) wParts.push(`máx <strong>${fmt(pc.maxWidth)} m</strong>`);
                if (pc.minHeight != null) hParts.push(`mín <strong>${fmt(pc.minHeight)} m</strong>`);
                if (pc.maxHeight != null) hParts.push(`máx <strong>${fmt(pc.maxHeight)} m</strong>`);
                let html = '<div class="m2calc-limits-row">';
                if (wParts.length) html += `<span>${CONFIG.widthLabel}: ${wParts.join(' · ')}</span>`;
                if (hParts.length) html += `<span>${CONFIG.heightLabel}: ${hParts.join(' · ')}</span>`;
                html += '</div>';
                this.limitsEl.innerHTML = html;
                this.limitsEl.style.display = '';
            }
        }

        setupEventListeners() {
            [this.widthInput, this.heightInput].forEach(input => {
                // Bloqueia teclas inválidas antes de chegarem ao valor;
                // vírgula é interceptada e convertida em ponto
                input.addEventListener('keydown', (e) => {
                    if (e.key === ',' || e.key === 'Dead') {
                        e.preventDefault();
                        const start = input.selectionStart;
                        const end   = input.selectionEnd;
                        input.value = input.value.substring(0, start) + '.' + input.value.substring(end);
                        input.setSelectionRange(start + 1, start + 1);
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        return;
                    }
                    const allowed = [
                        'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
                        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                        'Home', 'End',
                    ];
                    if (
                        allowed.includes(e.key) ||
                        (e.key >= '0' && e.key <= '9') ||
                        e.key === '.' ||
                        e.key === '-' ||
                        e.ctrlKey || e.metaKey
                    ) return;
                    e.preventDefault();
                });

                // Remove vírgulas e letras coladas (ex: via Ctrl+V ou autocomplete)
                input.addEventListener('input', (e) => {
                    const raw     = input.value;
                    const cleaned = raw.replace(/,/g, '.').replace(/[^0-9.]/g, '');
                    // Garante no máximo um ponto decimal
                    const parts   = cleaned.split('.');
                    const fixed   = parts.length > 2
                        ? parts[0] + '.' + parts.slice(1).join('')
                        : cleaned;
                    if (fixed !== raw) {
                        const pos = input.selectionStart - (raw.length - fixed.length);
                        input.value = fixed;
                        try { input.setSelectionRange(pos, pos); } catch (_) {}
                    }
                    this.validateField(input);
                    this.refreshSummary();
                    // Medidas mudaram — exige nova confirmação
                    const acoes = document.querySelector('.principal .acoes-produto');
                    if (acoes) acoes.classList.add('notCalculated');
                });
            });

            this.button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });

            // Intercepta clique no botão de compra enquanto medidas não confirmadas
            document.addEventListener('click', (e) => {
                const buyBtn = e.target.closest('.botao-comprar');
                if (!buyBtn) return;
                const acoes = buyBtn.closest('.acoes-produto');
                if (acoes && acoes.classList.contains('notCalculated')) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }, true);

            // Define o atributo de tooltip no(s) botão(ões) de compra
            document.querySelectorAll('.principal .botao-comprar').forEach(btn => {
                btn.setAttribute('data-m2calc-tip', CONFIG.notCalculatedMessage);
            });
        }

        validateField(input) {
            const pc      = this.productConfig;
            const isWidth = input === this.widthInput;
            const val     = parseFloat(input.value);
            const errorEl = isWidth ? this.widthError : this.heightError;

            const minVal  = isWidth ? pc.minWidth  : pc.minHeight;
            const maxVal  = isWidth ? pc.maxWidth  : pc.maxHeight;
            const errMin  = isWidth ? CONFIG.errorMinWidth  : CONFIG.errorMinHeight;
            const errMax  = isWidth ? CONFIG.errorMaxWidth  : CONFIG.errorMaxHeight;
            const errInv  = isWidth ? CONFIG.errorInvalidWidth : CONFIG.errorInvalidHeight;

            input.classList.remove('m2calc-input-error');
            errorEl.textContent = '';

            if (input.value === '' || input.value === '-') return; // ainda digitando

            if (isNaN(val) || val < 0) {
                this.setFieldError(input, errorEl, errInv);
            } else if (minVal != null && val > 0 && val < minVal) {
                this.setFieldError(input, errorEl, `${errMin} ${minVal} m`);
            } else if (maxVal != null && val > maxVal && CONFIG.panelSplitEnabled === false) {
                this.setFieldError(input, errorEl, `${errMax} ${maxVal} m`);
            }
        }

        // ----------------------------------------
        // LÓGICA INTERNA
        // ----------------------------------------

        getUnitPrice() {
            const pc = this.productConfig;
            const selector  = pc.priceSelector  || CONFIG.priceSelector;
            const attribute = pc.priceAttribute || CONFIG.priceAttribute;
            try {
                const el = document.querySelector(selector);
                if (el) {
                    const raw = el.getAttribute(attribute);
                    if (raw != null) {
                        // Aceita tanto "19.90" quanto "1990" (centavos inteiros)
                        const parsed = parseFloat(raw);
                        return isNaN(parsed) ? null : parsed;
                    }
                }
            } catch (e) {
                console.warn('[M2Calculator] Erro ao obter preço unitário:', e);
            }
            return null;
        }

        calculateQuantity(width, height) {
            const pc = this.productConfig;
            if (typeof pc.quantityFormula === 'function') {
                return pc.quantityFormula(width, height);
            }
            return Math.ceil(width * height * (pc.quantityRatio || 1));
        }

        calculatePanels(width, height) {
            const pc    = this.productConfig;
            const maxW  = pc.maxWidth  || Infinity;
            const maxH  = pc.maxHeight || Infinity;
            const cntX  = Math.ceil(width  / maxW);
            const cntY  = Math.ceil(height / maxH);
            const panelW = width  / cntX;
            const panelH = height / cntY;
            const panels = [];
            let idx = 1;
            for (let y = 0; y < cntY; y++) {
                for (let x = 0; x < cntX; x++) {
                    panels.push({
                        index: idx++,
                        width: panelW,
                        height: panelH,
                        quantity: this.calculateQuantity(panelW, panelH),
                    });
                }
            }
            return { panels, cntX, cntY, panelW, panelH };
        }

        renderPanelDiagram(cntX, cntY, panelW, panelH) {
            const totalW = panelW * cntX;
            const totalH = panelH * cntY;
            const ML = 32, MT = 8, MR = 8, MB = 28;
            const DRAW_W = 220;
            const rawH   = DRAW_W * (totalH / totalW);
            const DRAW_H = Math.min(Math.max(rawH, 70), 180);
            const VW     = ML + DRAW_W + MR;
            const VH     = MT + DRAW_H + MB;
            const cellW  = DRAW_W / cntX;
            const cellH  = DRAW_H / cntY;
            const clrP   = CONFIG.colors.primary;
            const clrB   = CONFIG.colors.border;
            const clrL   = CONFIG.colors.label;
            const fmt    = v => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
            const f1     = v => v.toFixed(1);
            const FILLS  = [clrP + '22', clrP + '44'];

            let cells = '';
            for (let y = 0; y < cntY; y++) {
                for (let x = 0; x < cntX; x++) {
                    const rx  = ML + x * cellW;
                    const ry  = MT + y * cellH;
                    const idx = y * cntX + x + 1;
                    cells += `<rect x="${f1(rx)}" y="${f1(ry)}" width="${f1(cellW)}" height="${f1(cellH)}" fill="${FILLS[(x + y) % 2]}" stroke="${clrB}" stroke-width="1.5"/>`;
                    const cx = rx + cellW / 2;
                    const cy = ry + cellH / 2;
                    const showDim = cellW >= 52 && cellH >= 32;
                    const numY = showDim ? cy - 7 : cy;
                    cells += `<text x="${f1(cx)}" y="${f1(numY)}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="700" fill="${clrP}" font-family="sans-serif">${idx}</text>`;
                    if (showDim) {
                        cells += `<text x="${f1(cx)}" y="${f1(ry + cellH - 7)}" text-anchor="middle" font-size="9" fill="${clrL}" font-family="sans-serif">${fmt(panelW)}×${fmt(panelH)}m</text>`;
                    }
                }
            }

            // Dimension lines
            const ax1 = ML, ax2 = ML + DRAW_W, ay = MT + DRAW_H + 14;
            const hx = ML - 16, hy1 = MT, hy2 = MT + DRAW_H, hym = (hy1 + hy2) / 2;

            return `<svg class="m2calc-panel-diagram" viewBox="0 0 ${VW} ${f1(VH)}" xmlns="http://www.w3.org/2000/svg">
                <g stroke="${clrB}" stroke-width="1.5" fill="none">
                    <rect x="${ML}" y="${MT}" width="${DRAW_W}" height="${f1(DRAW_H)}"/>
                </g>
                ${cells}
                <g stroke="${clrL}" stroke-width="1">
                    <line x1="${ax1}" y1="${f1(ay)}" x2="${ax2}" y2="${f1(ay)}"/>
                    <line x1="${ax1}" y1="${f1(ay - 4)}" x2="${ax1}" y2="${f1(ay + 4)}"/>
                    <line x1="${ax2}" y1="${f1(ay - 4)}" x2="${ax2}" y2="${f1(ay + 4)}"/>
                    <line x1="${hx}" y1="${hy1}" x2="${hx}" y2="${f1(hy2)}"/>
                    <line x1="${f1(hx - 4)}" y1="${hy1}" x2="${f1(hx + 4)}" y2="${hy1}"/>
                    <line x1="${f1(hx - 4)}" y1="${f1(hy2)}" x2="${f1(hx + 4)}" y2="${f1(hy2)}"/>
                </g>
                <text x="${f1((ax1 + ax2) / 2)}" y="${f1(ay + 11)}" text-anchor="middle" font-size="10" fill="${clrL}" font-family="sans-serif">${fmt(totalW)} m</text>
                <text x="${f1(hx)}" y="${f1(hym)}" text-anchor="middle" font-size="10" fill="${clrL}" font-family="sans-serif" transform="rotate(-90 ${hx} ${f1(hym)})">${fmt(totalH)} m</text>
            </svg>`;
        }

        validate() {
            const pc     = this.productConfig;
            const width  = parseFloat(this.widthInput.value);
            const height = parseFloat(this.heightInput.value);
            let valid = true;

            // Reset
            this.widthInput.classList.remove('m2calc-input-error');
            this.heightInput.classList.remove('m2calc-input-error');
            this.widthError.textContent  = '';
            this.heightError.textContent = '';

            // Validar largura
            if (isNaN(width) || width <= 0) {
                this.setFieldError(this.widthInput, this.widthError, CONFIG.errorInvalidWidth);
                valid = false;
            } else if (pc.minWidth != null && width < pc.minWidth) {
                this.setFieldError(this.widthInput, this.widthError, `${CONFIG.errorMinWidth} ${pc.minWidth} m`);
                valid = false;
            } else if (pc.maxWidth != null && width > pc.maxWidth && CONFIG.panelSplitEnabled === false) {
                this.setFieldError(this.widthInput, this.widthError, `${CONFIG.errorMaxWidth} ${pc.maxWidth} m`);
                valid = false;
            }

            // Validar altura
            if (isNaN(height) || height <= 0) {
                this.setFieldError(this.heightInput, this.heightError, CONFIG.errorInvalidHeight);
                valid = false;
            } else if (pc.minHeight != null && height < pc.minHeight) {
                this.setFieldError(this.heightInput, this.heightError, `${CONFIG.errorMinHeight} ${pc.minHeight} m`);
                valid = false;
            } else if (pc.maxHeight != null && height > pc.maxHeight && CONFIG.panelSplitEnabled === false) {
                this.setFieldError(this.heightInput, this.heightError, `${CONFIG.errorMaxHeight} ${pc.maxHeight} m`);
                valid = false;
            }

            return valid;
        }

        setFieldError(input, errorEl, message) {
            input.classList.add('m2calc-input-error');
            errorEl.textContent = message;
        }

        refreshSummary() {
            const width  = parseFloat(this.widthInput.value);
            const height = parseFloat(this.heightInput.value);

            if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
                const pc = this.productConfig;
                const exceedsW = CONFIG.panelSplitEnabled !== false && pc.maxWidth  != null && width  > pc.maxWidth;
                const exceedsH = CONFIG.panelSplitEnabled !== false && pc.maxHeight != null && height > pc.maxHeight;
                this.panelMode = exceedsW || exceedsH;

                if (this.panelMode) {
                    // Oculta linhas do resumo normal
                    this.areaRow.style.display      = 'none';
                    this.quantityRow.style.display  = 'none';
                    this.totalRow.style.display     = 'none';
                    this.m2PriceRow.style.display   = 'none';
                    this.unitPriceRow.style.display = 'none';

                    // Calcula e renderiza diagrama de painéis
                    const { panels, cntX, cntY, panelW, panelH } = this.calculatePanels(width, height);
                    const totalQty  = panels.reduce((sum, p) => sum + p.quantity, 0);
                    const unitPrice = this.getUnitPrice();

                    // Título com contagem de painéis e grade
                    this.panelTitle.textContent = `${panels.length} ${panels.length === 1 ? 'painel necessário' : 'painéis necessários'}`;
                    if (cntX > 1 && cntY > 1) {
                        const small = document.createElement('small');
                        small.className = 'm2calc-panel-grid-info';
                        small.textContent = ` (${cntX} col × ${cntY} lin)`;
                        this.panelTitle.appendChild(small);
                    }

                    this.panelItems.innerHTML = this.renderPanelDiagram(cntX, cntY, panelW, panelH);

                    if (unitPrice !== null) {
                        const total = totalQty * unitPrice;
                        this.panelTotalValue.textContent = `${totalQty} un. — ${this.formatCurrency(total)}`;
                    } else {
                        this.panelTotalValue.textContent = `${totalQty} un.`;
                    }

                    this.panelSection.style.display = '';
                } else {
                    // Modo normal — exibe linhas do resumo
                    this.panelSection.style.display = 'none';
                    this.areaRow.style.display     = '';
                    this.quantityRow.style.display = '';
                    this.totalRow.style.display    = '';

                    const area      = width * height;
                    const quantity  = this.calculateQuantity(width, height);
                    const unitPrice = this.getUnitPrice();

                    this.areaValue.textContent     = area.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) + ' m²';
                    this.quantityValue.textContent = quantity + ' un.';

                    if (unitPrice !== null) {
                        const ratio   = pc.quantityRatio || 1;
                        const m2Price = unitPrice * ratio;
                        const total   = quantity * unitPrice;
                        this.unitPriceValue.textContent = this.formatCurrency(unitPrice);
                        this.m2PriceValue.textContent   = this.formatCurrency(m2Price);
                        this.totalValue.textContent     = this.formatCurrency(total);
                        this.unitPriceRow.style.display = '';
                        this.m2PriceRow.style.display   = '';
                    } else {
                        this.unitPriceRow.style.display = 'none';
                        this.m2PriceRow.style.display   = 'none';
                        this.totalValue.textContent     = '—';
                    }
                }

                this.summary.classList.add('m2calc-visible');
            } else {
                this.panelMode = false;
                this.panelSection.style.display = 'none';
                this.summary.classList.remove('m2calc-visible');
            }
        }

        handleSubmit() {
            if (!this.validate()) return;

            const width  = parseFloat(this.widthInput.value);
            const height = parseFloat(this.heightInput.value);

            let quantity;
            let panels = null;
            if (this.panelMode) {
                const result = this.calculatePanels(width, height);
                panels   = result.panels;
                quantity = panels.reduce((sum, p) => sum + p.quantity, 0);
                if (typeof CONFIG.onPanelsCalculated === 'function') {
                    CONFIG.onPanelsCalculated(panels);
                }
            } else {
                quantity = this.calculateQuantity(width, height);
            }

            this.calculatedQuantity = quantity;

            // Remove o bloqueio de compra
            const acoes = document.querySelector('.principal .acoes-produto');
            if (acoes) acoes.classList.remove('notCalculated');

            // Salva as medidas no sessionStorage (chave: ID_SKU_measures)
            try {
                const skuEl = document.querySelector('[itemprop="sku"]');
                const sku   = skuEl ? skuEl.textContent.trim() : '';
                const acoesProd = document.querySelector('.principal .acoes-produto');
                const prodId    = acoesProd ? acoesProd.getAttribute('data-produto-id') : '';
                const key       = [prodId, 'measures'].filter(Boolean).join('_');
                if (key) {
                    const data = { sku: sku, width, height, quantity };
                    if (panels) data.panels = panels.map(p => ({ index: p.index, width: p.width, height: p.height, quantity: p.quantity }));
                    sessionStorage.setItem(key, JSON.stringify(data));
                }
            } catch (_) {}

            if (typeof CONFIG.onQuantityCalculated === 'function') {
                CONFIG.onQuantityCalculated(quantity);
            }
        }

        formatCurrency(value) {
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        /**
         * Retorna a última quantidade calculada e confirmada
         */
        getQuantity() {
            return this.calculatedQuantity;
        }

        /**
         * Remove o plugin da página
         */
        destroy() {
            const container = document.getElementById('m2-calculator-container');
            if (container) container.remove();
            const styles = document.getElementById('m2-calculator-styles');
            if (styles) styles.remove();
        }

        /**
         * Reinicializa o plugin
         */
        reinit() {
            this.destroy();
            this.init();
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================

    /**
     * Avalia uma string de condição JavaScript em tempo de execução.
     * Retorna true se a condição for satisfeita, false caso contrário.
     */
    function evaluateCondition(condition) {
        try {
            // Uso intencional de Function para avaliar condições configuradas pelo próprio cliente.
            // Nunca avalie condições provenientes de fontes externas não confiáveis.
            return new Function('return (' + condition + ')')(); // eslint-disable-line no-new-func
        } catch (e) {
            console.warn('[M2Calculator] Erro ao avaliar condição:', condition, e);
            return false;
        }
    }

    function findActiveProduct() {
        for (const product of CONFIG.products) {
            if (!product.condition || evaluateCondition(product.condition)) {
                return product;
            }
        }
        return null;
    }

    function initM2Calculator() {
        const activeProduct = findActiveProduct();

        if (!activeProduct) {
            return; // Nenhum produto ativo para esta página — plugin silencioso
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.M2Calculator = new M2Calculator(activeProduct);
            });
        } else {
            window.M2Calculator = new M2Calculator(activeProduct);
        }
    }

    // ========================================
    // CHECKOUT MEASURES — exibe medidas no carrinho
    // ========================================

    function initCheckoutMeasures() {
        if (!document.querySelector('.pagina-carrinho')) return;

        function fmt(v) {
            return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
        }

        function findMeasures(produtoId) {
            var prefix = produtoId + '_';
            var suffix = '_measures';
            for (var i = 0; i < sessionStorage.length; i++) {
                var key = sessionStorage.key(i);
                if (key.indexOf(prefix) === 0 && key.slice(-suffix.length) === suffix) {
                    try { return JSON.parse(sessionStorage.getItem(key)); } catch (_) {}
                }
            }
            return null;
        }

        function buildHTML(data) {
            var c = CONFIG.colors;
            var wrapStyle = [
                'display:inline-block', 'margin-top:6px', 'padding:5px 10px',
                'border-radius:4px', 'font-size:12px', 'line-height:1.6',
                'background:' + c.background + '88',
                'border:1px solid ' + c.border,
                'color:' + c.text,
            ].join(';');
            var lblStyle = 'font-weight:700;color:' + c.label + ';margin-right:4px;';

            var html = '<div class="m2calc-checkout-info" style="' + wrapStyle + '">';
            html += '<span style="' + lblStyle + '">' + CONFIG.checkoutLabel + '</span>';

            if (data.panels && data.panels.length > 1) {
                var totalW = data.panels[0].width  * Math.round(data.panels.length / (data.height / data.panels[0].height));
                var totalH = data.height;
                html += data.panels.length + ' painel(is):<ul style="margin:0;">';
                data.panels.forEach(function (p) {
                    html += '<li>' + CONFIG.checkoutPanelLabel + ' ' + p.index + ': '
                         + fmt(p.width) + 'm × ' + fmt(p.height) + 'm — ' + p.quantity + ' un.</li>';
                });
                html += '</ul>';
                html += '<span style="' + lblStyle + '">Total:</span> '
                     + CONFIG.checkoutWidthLabel  + ': <strong>' + fmt(data.width)  + ' m</strong>'
                     + ' &nbsp;|&nbsp; '
                     + CONFIG.checkoutHeightLabel + ': <strong>' + fmt(data.height) + ' m</strong>'
                     + ' &nbsp;|&nbsp; ' + data.quantity + ' un.';
            } else {
                html += CONFIG.checkoutWidthLabel  + ': <strong>' + fmt(data.width)  + ' m</strong>'
                     + ' &nbsp;|&nbsp; '
                     + CONFIG.checkoutHeightLabel + ': <strong>' + fmt(data.height) + ' m</strong>'
                     + ' &nbsp;|&nbsp; '
                     + (data.width * data.height).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) + ' m²'
                     + ' &nbsp;|&nbsp; ' + data.quantity + ' un.';
            }
            html += '</div>';
            return html;
        }

        function render() {
            document.querySelectorAll('[data-produto-id]').forEach(function (el) {
                var produtoId = el.getAttribute('data-produto-id');
                if (!produtoId || el.querySelector('.m2calc-checkout-info')) return;
                var data = findMeasures(produtoId);
                if (!data) return;
                var info = el.querySelector('.produto-info');
                if (info) info.insertAdjacentHTML('beforeend', buildHTML(data));

                // Remove controles de quantidade e bloqueia o input
                el.querySelectorAll('.icon-minus, .icon-plus').forEach(function (btn) { btn.remove(); });
                var qtyInput = el.querySelector('[name="quantidade"]');
                if (qtyInput) qtyInput.setAttribute('readonly', 'readonly');
            });
        }

        // ----------------------------------------
        // Campo nova_obs — preenche com medidas e clona para observações do cliente
        // ----------------------------------------

        function initObsField() {
            if (!document.querySelector('.pagina-carrinho.carrinho-checkout')) return;

            var obsField = document.querySelector('[name="nova_obs"]');
            if (!obsField) return;

            // Coleta todas as entradas de medidas no sessionStorage
            function findAllMeasures() {
                var results = [];
                var suffix = '_measures';
                for (var i = 0; i < sessionStorage.length; i++) {
                    var key = sessionStorage.key(i);
                    if (key.slice(-suffix.length) === suffix) {
                        try {
                            var data = JSON.parse(sessionStorage.getItem(key));
                            if (data) results.push(data);
                        } catch (_) {}
                    }
                }
                return results;
            }

            // Constrói texto de medidas para nova_obs
            function buildMeasuresText(all) {
                return all.map(function (data) {
                    var line = '[SKU: ' + (data.sku || '—') + '] ';
                    if (data.panels && data.panels.length > 1) {
                        line += data.panels.map(function (p) {
                            return 'Painel ' + p.index + ': ' + fmt(p.width) + 'm × ' + fmt(p.height) + 'm — ' + p.quantity + ' un.';
                        }).join(' | ');
                        line += ' | Total: Largura: ' + fmt(data.width) + 'm | Altura: ' + fmt(data.height) + 'm | ' + data.quantity + ' un.';
                    } else {
                        line += 'Largura: ' + fmt(data.width) + 'm | Altura: ' + fmt(data.height) + 'm | ' + data.quantity + ' un.';
                    }
                    return line;
                }).join('\n');
            }

            var allMeasures = findAllMeasures();
            if (!allMeasures.length) return;

            var measuresText = buildMeasuresText(allMeasures);

            // Oculta o campo original (será submetido normalmente pelo formulário)
            obsField.style.display = 'none';

            // Cria clone visível sem atributo name para não duplicar no submit
            var clone = obsField.cloneNode(true);
            clone.removeAttribute('name');
            clone.setAttribute('id', 'm2calc-obs-clone');
            clone.style.display = '';
            clone.value = '';
            obsField.parentNode.insertBefore(clone, obsField.nextSibling);

            // Preenche nova_obs com o texto de medidas
            obsField.value = measuresText;

            // Sincroniza edições do clone → nova_obs (medidas + observação do cliente)
            clone.addEventListener('input', function () {
                obsField.value = measuresText + (clone.value ? '\n======\nObservações:\n' + clone.value : '');
            });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { render(); initObsField(); });
        } else {
            render();
            initObsField();
        }
    }

    // ========================================
    // AVISO — produto já no carrinho (página do produto)
    // ========================================

    function initProductCartWarning() {
      
        if (document.querySelector('.pagina-carrinho')) return;

        var acoes = document.querySelector('.principal .acoes-produto[data-produto-id]');
        if (!acoes) return;

        var produtoId = acoes.getAttribute('data-produto-id');
        if (!produtoId) return;

        var measuresKey = produtoId + '_measures';
        if (!sessionStorage.getItem(measuresKey)) return;

        var removeUrl = '/carrinho/produto/' + produtoId + '/remover';
        var c = CONFIG.colors;

        var warning = document.createElement('div');
        warning.id = 'm2calc-cart-warning';
        warning.style.cssText = [
            'margin:12px 0', 'padding:10px 14px', 'border-radius:6px',
            'font-size:13px', 'line-height:1.5',
            'background:#fff8e1', 'border:1px solid #f9a825', 'color:#5d4037'
        ].join(';');
        warning.innerHTML = 'Produto j\u00e1 se encontra no carrinho. Para editar medidas remova o produto para iniciar o processo novamente.'
         + '<a href="' + removeUrl + '" id="m2calc-remove-link" style="color:'
            + c.primary + ';font-weight:700;text-decoration:underline!important;cursor:pointer;">Remover produto.</a>';

        warning.querySelector('#m2calc-remove-link').addEventListener('click', function (e) {
            e.preventDefault();
            var link = e.currentTarget;
            link.style.pointerEvents = 'none';
            link.textContent = 'removendo…';
            var xhr = new XMLHttpRequest();
            xhr.open('GET', removeUrl, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                sessionStorage.removeItem(measuresKey);
                window.location.reload();
            };
            xhr.onerror = function () {
                sessionStorage.removeItem(measuresKey);
                window.location.reload();
            };
            xhr.send();
        });

        // Insere antes do container do calculador, ou antes das ações do produto
        var container = document.getElementById('m2-calculator-container');
        if (container && container.parentNode) {
            container.parentNode.insertBefore(warning, container);
        } else {
            acoes.parentNode.insertBefore(warning, acoes);
        }
    }

    initM2Calculator();
    initCheckoutMeasures();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProductCartWarning);
    } else {
        initProductCartWarning();
    }

})();
