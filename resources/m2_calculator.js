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

        // Callback global chamado quando a quantidade é calculada e confirmada.
        // Recebe a quantidade (número inteiro) como único argumento.
        // Ex: function(quantity) { document.querySelector('[name="qty"]').value = quantity; }
        onQuantityCalculated: function (quantity) {
            console.warn('[M2Calculator] Configure onQuantityCalculated. Quantidade:', quantity);
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
                display: block;
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
                <div class="m2calc-summary-row">
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
                <div class="m2calc-summary-row">
                    <span id="m2calc-quantity-label"></span>
                    <span class="m2calc-summary-val" id="m2calc-quantity-value"></span>
                </div>
                <div class="m2calc-summary-row m2calc-row-total">
                    <span id="m2calc-total-label"></span>
                    <span class="m2calc-summary-val" id="m2calc-total-value"></span>
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
            this.init();
        }

        init() {
            this.injectStyles();
            this.injectHTML();
            this.setupElements();
            this.setupEventListeners();
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
            this.areaLabel      = document.getElementById('m2calc-area-label');
            this.areaValue      = document.getElementById('m2calc-area-value');
            this.m2PriceRow     = document.getElementById('m2calc-m2price-row');
            this.m2PriceLabel   = document.getElementById('m2calc-m2price-label');
            this.m2PriceValue   = document.getElementById('m2calc-m2price-value');
            this.unitPriceRow   = document.getElementById('m2calc-unit-price-row');
            this.unitPriceLabel = document.getElementById('m2calc-unit-price-label');
            this.unitPriceValue = document.getElementById('m2calc-unit-price-value');
            this.quantityLabel  = document.getElementById('m2calc-quantity-label');
            this.quantityValue  = document.getElementById('m2calc-quantity-value');
            this.totalLabel     = document.getElementById('m2calc-total-label');
            this.totalValue     = document.getElementById('m2calc-total-value');
            this.button         = document.getElementById('m2calc-btn');

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

            // Limites e step
            if (pc.minWidth  != null) this.widthInput.min  = pc.minWidth;
            if (pc.maxWidth  != null) this.widthInput.max  = pc.maxWidth;
            if (pc.minHeight != null) this.heightInput.min = pc.minHeight;
            if (pc.maxHeight != null) this.heightInput.max = pc.maxHeight;
            if (pc.widthStep  != null) this.widthInput.step  = pc.widthStep;
            if (pc.heightStep != null) this.heightInput.step = pc.heightStep;
        }

        setupEventListeners() {
            [this.widthInput, this.heightInput].forEach(input => {
                // Bloqueia teclas inválidas antes de chegarem ao valor
                input.addEventListener('keydown', (e) => {
                    const allowed = [
                        'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
                        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                        'Home', 'End',
                    ];
                    // Permite: teclas de controle, dígitos, ponto decimal e sinal de subtração
                    if (
                        allowed.includes(e.key) ||
                        (e.key >= '0' && e.key <= '9') ||
                        e.key === '.' ||
                        e.key === '-' ||
                        e.ctrlKey || e.metaKey // copiar/colar/etc.
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
                });
            });

            this.button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSubmit();
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
            } else if (maxVal != null && val > maxVal) {
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
            } else if (pc.maxWidth != null && width > pc.maxWidth) {
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
            } else if (pc.maxHeight != null && height > pc.maxHeight) {
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
                const pc         = this.productConfig;
                const area       = width * height;
                const quantity   = this.calculateQuantity(width, height);
                const unitPrice  = this.getUnitPrice();

                // Área em m²
                this.areaValue.textContent     = area.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) + ' m²';
                this.quantityValue.textContent = quantity + ' un.';

                if (unitPrice !== null) {
                    const ratio    = pc.quantityRatio || 1;
                    const m2Price  = unitPrice * ratio;
                    const total    = quantity * unitPrice;

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

                this.summary.classList.add('m2calc-visible');
            } else {
                this.summary.classList.remove('m2calc-visible');
            }
        }

        handleSubmit() {
            if (!this.validate()) return;

            const width    = parseFloat(this.widthInput.value);
            const height   = parseFloat(this.heightInput.value);
            const quantity = this.calculateQuantity(width, height);

            this.calculatedQuantity = quantity;

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

    initM2Calculator();

})();
