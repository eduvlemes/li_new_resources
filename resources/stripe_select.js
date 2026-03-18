/**
 * stripe Select Dinâmica - Exibe uma barra fixa cujo texto muda de acordo com a opção selecionada no select
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.stripeSelectConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        active: true,
        position: 'top', // 'top' ou 'bottom'

        // Texto exibido enquanto nenhuma opção foi selecionada
        defaultText: 'Selecione sua região para ver a condição de frete',

        // Placeholder do select (primeiro item desabilitado)
        selectPlaceholder: 'Selecione...',

        // Valor pré-selecionado ao carregar (null = nenhum; ex: 'sul')
        // Se o usuário já tiver uma seleção salva, ela tem prioridade
        defaultSelected: null,

        // Lista de itens: cada item define o valor do select, o rótulo exibido
        // e o texto (aceita HTML) que aparece na stripe ao selecionar aquela opção
        items: [
            {
                value: 'sao-paulo',
                label: 'São Paulo',
                text: 'Adicione <b>R$ 99,99</b> ao carrinho para ter <b>FRETE GRÁTIS</b>'
            },
            {
                value: 'rio-de-janeiro',
                label: 'Rio de Janeiro',
                text: 'Adicione <b>R$ 149,99</b> ao carrinho para ter <b>FRETE GRÁTIS</b>'
            },
            {
                value: 'minas-gerais',
                label: 'Minas Gerais',
                text: 'Adicione <b>R$ 129,99</b> ao carrinho para ter <b>FRETE GRÁTIS</b>'
            },
            {
                value: 'outros',
                label: 'Outros estados',
                text: 'Frete calculado no carrinho — confira no checkout'
            }
        ],

        // Persistência: salva a última seleção do usuário
        storageKey: 'stripe_select_value',
        useLocalStorage: true, // true = persiste entre sessões, false = apenas na sessão atual

        // CORES E ESTILOS
        colors: {
            background: '#1a4a7a',
            text: '#ffffff',
            selectBackground: 'rgba(0,0,0,0.25)',
            selectText: '#ffffff',
            selectBorder: 'rgba(255,255,255,0.35)',
            selectArrow: '#ffffff'
        }
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.stripeSelectConfig && typeof window.stripeSelectConfig === 'object') {
        Object.assign(CONFIG, window.stripeSelectConfig);

        if (window.stripeSelectConfig.colors && typeof window.stripeSelectConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.stripeSelectConfig.colors);
        }

        // Garante que items seja sobrescrito completamente quando fornecido
        if (Array.isArray(window.stripeSelectConfig.items)) {
            CONFIG.items = window.stripeSelectConfig.items;
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    const CSS_STYLES = `
        <style id="stripe-select-styles">
            #stripe-select-container {
                width: 100%;
                background: ${CONFIG.colors.background};
                color: ${CONFIG.colors.text};
                z-index: 999999;
                padding: 11px 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                font-family: inherit;
                font-size: 14px;
                line-height: 1.4;
            }

            #stripe-select-container.stripe-position-top {
                position: relative;
                top: 0;
                left: 0;
            }

            #stripe-select-container.stripe-position-bottom {
                position: fixed;
                bottom: 0;
                left: 0;
            }

            .stripe-select-inner {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 24px;
                max-width: 990px;
                width: 100%;
                position: relative;
            }

            .stripe-select-text {
                flex: 1;
                text-align: center;
                font-size: 14px;
                color: ${CONFIG.colors.text};
                transition: opacity 0.25s ease;
            }

            .stripe-select-text b,
            .stripe-select-text strong {
                font-weight: 700;
            }

            .stripe-select-text.stripe-fade {
                opacity: 0;
            }

            .stripe-select-wrapper {
                position: relative;
                flex-shrink: 0;
            }

            .stripe-select-wrapper::after {
                content: '';
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 6px solid ${CONFIG.colors.selectArrow};
                pointer-events: none;
            }

            .stripe-select-dropdown {
                appearance: none;
                -webkit-appearance: none;
                background: ${CONFIG.colors.selectBackground};
                color: ${CONFIG.colors.selectText};
                border: 1px solid ${CONFIG.colors.selectBorder};
                border-radius: 6px;
                padding: 6px 32px 6px 12px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                outline: none;
                min-width: 140px;
                font-family: inherit;
            }

            .stripe-select-dropdown option {
                background: #1a1a2e;
                color: #ffffff;
            }

            .stripe-select-dropdown:focus {
                border-color: rgba(255,255,255,0.7);
            }

            /* Responsivo */
            @media (max-width: 768px) {
                #stripe-select-container {
                    padding: 10px 12px;
                }

                .stripe-select-inner {
                    flex-direction: column;
                    gap: 8px;
                }

                .stripe-select-text {
                    font-size: 13px;
                }

                .stripe-select-dropdown {
                    min-width: 200px;
                    width: 100%;
                }
            }
        </style>
    `;

    function buildHTMLTemplate() {
        const positionClass = CONFIG.position === 'bottom'
            ? 'stripe-position-bottom'
            : 'stripe-position-top';

        const optionsHTML = CONFIG.items
            .map(item => `<option value="${escapeAttr(item.value)}">${escapeAttr(item.label)}</option>`)
            .join('\n                    ');

        return `
        <div id="stripe-select-container" class="${positionClass}">
            <div class="stripe-select-inner">
                <div class="stripe-select-text" id="stripe-select-text">${CONFIG.defaultText}</div>
                <div class="stripe-select-wrapper">
                    <select class="stripe-select-dropdown" id="stripe-select-dropdown" aria-label="${escapeAttr(CONFIG.selectPlaceholder)}">
                        <option value="" disabled selected>${escapeAttr(CONFIG.selectPlaceholder)}</option>
                        ${optionsHTML}
                    </select>
                </div>
            </div>
        </div>
        `;
    }

    function escapeAttr(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class stripeSelectDinamica {
        constructor() {
            this.textEl = null;
            this.selectEl = null;
            this.init();
        }

        init() {
            if (!CONFIG.active) return;
            this.injectStyles();
            this.injectHTML();
            this.setupElements();
            this.restoreSelection();
            this.setupEventListeners();
        }

        injectStyles() {
            if (!document.getElementById('stripe-select-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        injectHTML() {
            const existing = document.getElementById('stripe-select-container');
            if (existing) existing.remove();
            document.body.insertAdjacentHTML('afterbegin', buildHTMLTemplate());
        }

        setupElements() {
            this.textEl   = document.getElementById('stripe-select-text');
            this.selectEl = document.getElementById('stripe-select-dropdown');
        }

        restoreSelection() {
            let resolved = null;

            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                const saved = storage.getItem(CONFIG.storageKey);
                if (saved) {
                    resolved = CONFIG.items.find(item => item.value === saved) || null;
                }
            } catch (e) {
                // storage indisponível — segue sem restaurar
            }

            // Fallback: usar pré-seleção configurada
            if (!resolved && CONFIG.defaultSelected) {
                resolved = CONFIG.items.find(item => item.value === CONFIG.defaultSelected) || null;
            }

            if (resolved) {
                this.selectEl.value = resolved.value;
                this.updateText(resolved.text, false);
            }
        }

        setupEventListeners() {
            if (!this.selectEl) return;

            this.selectEl.addEventListener('change', () => {
                const selectedValue = this.selectEl.value;
                const match = CONFIG.items.find(item => item.value === selectedValue);

                if (match) {
                    this.updateText(match.text, true);
                    this.saveSelection(selectedValue);
                }
            });
        }

        updateText(html, animate) {
            if (!this.textEl) return;

            if (animate) {
                this.textEl.classList.add('stripe-fade');
                setTimeout(() => {
                    this.textEl.innerHTML = html;
                    this.textEl.classList.remove('stripe-fade');
                }, 250);
            } else {
                this.textEl.innerHTML = html;
            }
        }

        saveSelection(value) {
            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                storage.setItem(CONFIG.storageKey, value);
            } catch (e) {
                // storage indisponível
            }
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        /**
         * Seleciona programaticamente um item pelo valor
         * @param {string} value - Valor do item a selecionar
         */
        select(value) {
            const match = CONFIG.items.find(item => item.value === value);
            if (!match || !this.selectEl) return;
            this.selectEl.value = value;
            this.updateText(match.text, true);
            this.saveSelection(value);
        }

        /**
         * Redefine a stripe para o estado inicial (sem seleção)
         */
        reset() {
            if (!this.selectEl || !this.textEl) return;
            this.selectEl.value = '';
            this.updateText(CONFIG.defaultText, true);
            try {
                const storage = CONFIG.useLocalStorage ? localStorage : sessionStorage;
                storage.removeItem(CONFIG.storageKey);
            } catch (e) {
                // ignorar
            }
        }

        /**
         * Remove completamente o plugin do DOM
         */
        destroy() {
            const container = document.getElementById('stripe-select-container');
            if (container) container.remove();

            const styles = document.getElementById('stripe-select-styles');
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
    function initstripeSelectDinamica() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.stripeSelectDinamica = new stripeSelectDinamica();
            });
        } else {
            window.stripeSelectDinamica = new stripeSelectDinamica();
        }
    }

    initstripeSelectDinamica();

})();
