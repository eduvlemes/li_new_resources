/**
 * Product Customizer - Exibe um modal de personalização antes de adicionar ao carrinho
 *
 * Intercepta cliques no botão ".botao.botao-comprar.principal", abre um modal com campos
 * configuráveis e salva as respostas no sessionStorage com a chave:
 *   [storagePrefix] + [data-produto-id] + "_properties"
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.ProductCustomizerConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        active: true,

        // Campos exibidos no modal de personalização.
        // Cada entrada pode ter as seguintes propriedades:
        //   id          {string}   - Identificador único do campo (usado como chave no JSON salvo)
        //   label       {string}   - Rótulo exibido ao usuário
        //   type        {string}   - Tipo do campo: "text" | "textarea" | "select" | "radio" | "checkbox" | "number" | "email" | "tel"
        //   required    {boolean}  - Se o campo é obrigatório
        //   placeholder {string}   - Placeholder (text, textarea, number, email, tel)
        //   options     {Array}    - Opções para select, radio ou checkbox com múltiplas escolhas.
        //                           Pode ser array de strings ou array de { value, label }
        //   errorMessage {string}  - Mensagem de erro personalizada (opcional — usa requiredMessage como fallback)
        //   showIf      {Object}   - Exibe o campo condicionalmente. Estrutura:
        //                           { field: "idDoOutroCampo", value: "valorEsperado" }
        //                           ou { field: "idDoOutroCampo", values: ["val1", "val2"] }
        //                           O campo só aparece quando o campo referenciado tem o valor indicado.
        fields: [
            {
                id: "nome",
                label: "Nome para personalização",
                type: "text",
                required: true,
                placeholder: "Ex: João da Silva"
            }
        ],

        // Textos da interface
        modalTitle: "Personalize seu produto",
        modalSubtitle: "Preencha as informações abaixo antes de adicionar ao carrinho.",
        confirmButtonText: "Confirmar e adicionar",
        cancelButtonText: "Cancelar",
        requiredLabel: "*",
        requiredMessage: "Por favor, preencha todos os campos obrigatórios.",

        // Prefixo opcional para a chave do sessionStorage.
        // A chave final será: storagePrefix + productId + "_properties"
        storagePrefix: "",

        // Seletor CSS do botão que dispara o modal.
        // Pode ser sobrescrito para adaptar a outras lojas ou layouts.
        buttonSelector: ".botao.botao-comprar.principal:not(.desativo)",

        // CORES E ESTILOS
        colors: {
            overlayBackground: "rgba(0, 0, 0, 0.55)",
            modalBackground: "#ffffff",
            modalBorder: "#e5e7eb",
            titleColor: "#1f2937",
            subtitleColor: "#6b7280",
            labelColor: "#374151",
            requiredColor: "#ef4444",
            inputBackground: "#ffffff",
            inputBorder: "#d1d5db",
            inputBorderFocus: "#3b82f6",
            inputText: "#1f2937",
            inputPlaceholder: "#9ca3af",
            confirmBackground: "#3b82f6",
            confirmText: "#ffffff",
            confirmHover: "#2563eb",
            cancelBackground: "#f3f4f6",
            cancelText: "#374151",
            cancelHover: "#e5e7eb",
            errorBorder: "#ef4444",
            errorText: "#ef4444",
            modalShadow: "rgba(0, 0, 0, 0.18)"
        },

        // Dimensões
        modalMaxWidth: "500px",
        borderRadius: "12px"
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.ProductCustomizerConfig && typeof window.ProductCustomizerConfig === 'object') {
        Object.assign(CONFIG, window.ProductCustomizerConfig);

        // Mescla cores separadamente para permitir personalização parcial
        if (window.ProductCustomizerConfig.colors && typeof window.ProductCustomizerConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.ProductCustomizerConfig.colors);
        }

        // Campos: usa o padrão se o cliente não definiu
        if (!window.ProductCustomizerConfig.fields) {
            CONFIG.fields = DEFAULT_CONFIG.fields;
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    const CSS_STYLES = `
        <style id="product-customizer-styles">
            .pc-overlay {
                position: fixed;
                inset: 0;
                background: ${CONFIG.colors.overlayBackground};
                z-index: 99998;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                opacity: 0;
                transition: opacity 0.25s ease;
            }

            .pc-overlay.pc-visible {
                opacity: 1;
            }

            .pc-modal {
                background: ${CONFIG.colors.modalBackground};
                border: 1px solid ${CONFIG.colors.modalBorder};
                border-radius: ${CONFIG.borderRadius};
                box-shadow: 0 20px 60px ${CONFIG.colors.modalShadow};
                max-width: ${CONFIG.modalMaxWidth};
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                transform: translateY(20px);
                transition: transform 0.25s ease;
            }

            .pc-overlay.pc-visible .pc-modal {
                transform: translateY(0);
            }

            .pc-modal-header {
                padding: 24px 24px 0;
            }

            .pc-modal-title {
                font-size: 20px;
                font-weight: 700;
                color: ${CONFIG.colors.titleColor};
                margin: 0 0 6px;
                line-height: 1.3;
            }

            .pc-modal-subtitle {
                font-size: 14px;
                color: ${CONFIG.colors.subtitleColor};
                margin: 0;
                line-height: 1.5;
            }

            .pc-modal-body {
                padding: 20px 24px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .pc-field {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .pc-label {
                font-size: 14px;
                font-weight: 600;
                color: ${CONFIG.colors.labelColor};
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .pc-required-mark {
                color: ${CONFIG.colors.requiredColor};
                font-size: 14px;
            }

            body input.pc-input,
            .pc-textarea,
            .pc-select {
                width: 100%;
                padding: 10px 12px;
                border: 1.5px solid ${CONFIG.colors.inputBorder};
                border-radius: 8px;
                font-size: 14px;
                color: ${CONFIG.colors.inputText};
                background: ${CONFIG.colors.inputBackground};
                outline: none;
                transition: border-color 0.2s;
                box-sizing: border-box;
                font-family: inherit;
            }

            .pc-input::placeholder,
            .pc-textarea::placeholder {
                color: ${CONFIG.colors.inputPlaceholder};
            }

            .pc-input:focus,
            .pc-textarea:focus,
            .pc-select:focus {
                border-color: ${CONFIG.colors.inputBorderFocus};
            }

            .pc-input.pc-error,
            .pc-textarea.pc-error,
            .pc-select.pc-error {
                border-color: ${CONFIG.colors.errorBorder};
            }

            .pc-textarea {
                resize: vertical;
                min-height: 90px;
            }

            .pc-radio-group,
            .pc-checkbox-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .pc-radio-option,
            .pc-checkbox-option {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                font-size: 14px;
                color: ${CONFIG.colors.inputText};
            }

            .pc-radio-option input,
            .pc-checkbox-option input {
                width: 16px;
                height: 16px;
                cursor: pointer;
                accent-color: ${CONFIG.colors.inputBorderFocus};
                flex-shrink: 0;
            }

            .pc-error-msg {
                font-size: 12px;
                color: ${CONFIG.colors.errorText};
                display: none;
            }

            .pc-error-msg.pc-show {
                display: block;
            }

            .pc-field--hidden {
                display: none !important;
            }

            .pc-modal-footer {
                padding: 0 24px 24px;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .pc-btn {
                padding: 11px 22px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                border: none;
                transition: background 0.2s, transform 0.1s;
                font-family: inherit;
                line-height: 1;
            }

            .pc-btn:active {
                transform: scale(0.97);
            }

            .pc-btn-confirm {
                background: ${CONFIG.colors.confirmBackground};
                color: ${CONFIG.colors.confirmText};
            }

            .pc-btn-confirm:hover {
                background: ${CONFIG.colors.confirmHover};
            }

            .pc-btn-cancel {
                background: ${CONFIG.colors.cancelBackground};
                color: ${CONFIG.colors.cancelText};
            }

            .pc-btn-cancel:hover {
                background: ${CONFIG.colors.cancelHover};
            }

            @media (max-width: 480px) {
                .pc-modal-footer {
                    flex-direction: column-reverse;
                }

                .pc-btn {
                    width: 100%;
                    text-align: center;
                }
            }
        </style>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================

    class ProductCustomizer {
        constructor() {
            this.currentButton = null;
            this.overlay = null;
            this._pendingClick = false;
            this.init();
        }

        init() {
            this.injectStyles();
            this.injectHTML();
            this.setupElements();
            this.setupEventListeners();
        }

        injectStyles() {
            if (!document.getElementById('product-customizer-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        injectHTML() {
            const existing = document.getElementById('product-customizer-overlay');
            if (existing) existing.remove();

            const fieldsHTML = CONFIG.fields.map(field => this._buildFieldHTML(field)).join('');

            const subtitleHTML = CONFIG.modalSubtitle
                ? `<p class="pc-modal-subtitle">${this._esc(CONFIG.modalSubtitle)}</p>`
                : '';

            const html = `
                <div id="product-customizer-overlay" class="pc-overlay" role="dialog" aria-modal="true" aria-labelledby="pc-modal-title" style="display:none;">
                    <div class="pc-modal">
                        <div class="pc-modal-header">
                            <h2 class="pc-modal-title" id="pc-modal-title">${this._esc(CONFIG.modalTitle)}</h2>
                            ${subtitleHTML}
                        </div>
                        <div class="pc-modal-body">
                            ${fieldsHTML}
                        </div>
                        <div class="pc-modal-footer">
                            <button class="pc-btn pc-btn-cancel" id="pc-btn-cancel" type="button">${this._esc(CONFIG.cancelButtonText)}</button>
                            <button class="pc-btn pc-btn-confirm" id="pc-btn-confirm" type="button">${this._esc(CONFIG.confirmButtonText)}</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', html);
        }

        _buildFieldHTML(field) {
            const requiredMark = field.required
                ? `<span class="pc-required-mark" aria-hidden="true">${this._esc(CONFIG.requiredLabel)}</span>`
                : '';
            const errorId = `pc-error-${field.id}`;
            let inputHTML = '';

            switch (field.type) {
                case 'textarea':
                    inputHTML = `<textarea
                        class="pc-textarea"
                        id="pc-field-${field.id}"
                        name="${field.id}"
                        placeholder="${this._esc(field.placeholder || '')}"
                        aria-describedby="${errorId}"
                        ${field.required ? 'required' : ''}
                    ></textarea>`;
                    break;

                case 'select': {
                    const optionsHTML = (field.options || []).map(opt => {
                        const val = typeof opt === 'object' ? opt.value : opt;
                        const lbl = typeof opt === 'object' ? opt.label : opt;
                        return `<option value="${this._esc(val)}">${this._esc(lbl)}</option>`;
                    }).join('');
                    inputHTML = `<select
                        class="pc-select"
                        id="pc-field-${field.id}"
                        name="${field.id}"
                        aria-describedby="${errorId}"
                        ${field.required ? 'required' : ''}
                    >
                        <option value="">Selecione...</option>
                        ${optionsHTML}
                    </select>`;
                    break;
                }

                case 'radio': {
                    const radioOptions = (field.options || []).map(opt => {
                        const val = typeof opt === 'object' ? opt.value : opt;
                        const lbl = typeof opt === 'object' ? opt.label : opt;
                        return `<label class="pc-radio-option">
                            <input type="radio" name="${field.id}" value="${this._esc(val)}" ${field.required ? 'required' : ''}>
                            ${this._esc(lbl)}
                        </label>`;
                    }).join('');
                    inputHTML = `<div class="pc-radio-group" id="pc-field-${field.id}" role="radiogroup" aria-describedby="${errorId}">
                        ${radioOptions}
                    </div>`;
                    break;
                }

                case 'checkbox': {
                    if (field.options && field.options.length > 0) {
                        // Múltiplas opções de checkbox
                        const checkboxOptions = field.options.map(opt => {
                            const val = typeof opt === 'object' ? opt.value : opt;
                            const lbl = typeof opt === 'object' ? opt.label : opt;
                            return `<label class="pc-checkbox-option">
                                <input type="checkbox" name="${field.id}" value="${this._esc(val)}">
                                ${this._esc(lbl)}
                            </label>`;
                        }).join('');
                        inputHTML = `<div class="pc-checkbox-group" id="pc-field-${field.id}" aria-describedby="${errorId}">
                            ${checkboxOptions}
                        </div>`;
                    } else {
                        // Checkbox único (ex: aceite de termos)
                        inputHTML = `<label class="pc-checkbox-option">
                            <input type="checkbox" class="pc-checkbox-single" id="pc-field-${field.id}" name="${field.id}" aria-describedby="${errorId}" ${field.required ? 'required' : ''}>
                            ${this._esc(field.placeholder || field.label)}
                        </label>`;
                    }
                    break;
                }

                default:
                    // text, number, email, tel, etc.
                    inputHTML = `<input
                        type="${this._esc(field.type || 'text')}"
                        class="pc-input"
                        id="pc-field-${field.id}"
                        name="${field.id}"
                        placeholder="${this._esc(field.placeholder || '')}"
                        aria-describedby="${errorId}"
                        ${field.required ? 'required' : ''}
                    >`;
                    break;
            }

            // label for="..." só faz sentido para inputs simples; para grupos usamos aria
            const labelFor = ['radio', 'checkbox'].includes(field.type) && field.options && field.options.length > 0
                ? ''
                : `for="pc-field-${field.id}"`;

            // Campos com showIf começam ocultos; _updateConditionals() decide ao abrir
            const hiddenClass = field.showIf ? ' pc-field--hidden' : '';

            return `
                <div class="pc-field${hiddenClass}" data-field-id="${field.id}">
                    <label class="pc-label" ${labelFor}>
                        ${this._esc(field.label)}${requiredMark}
                    </label>
                    ${inputHTML}
                    <span class="pc-error-msg" id="${errorId}" role="alert"></span>
                </div>
            `;
        }

        setupElements() {
            this.overlay = document.getElementById('product-customizer-overlay');
            this.confirmBtn = document.getElementById('pc-btn-confirm');
            this.cancelBtn = document.getElementById('pc-btn-cancel');
        }

        setupEventListeners() {
            // Intercepta cliques no botão de compra na fase de captura
            document.addEventListener('click', (e) => {
                if (!CONFIG.active) return;

                const btn = e.target.closest(CONFIG.buttonSelector);
                if (!btn) return;

                // Se o flag de pendência está ativo, este é o clique que nós mesmos disparamos — deixa passar
                if (this._pendingClick) return;

                e.preventDefault();
                e.stopImmediatePropagation();

                this.currentButton = btn;
                this._openModal();
            }, true); // captura = true para interceptar antes de handlers nativos

            this.confirmBtn.addEventListener('click', () => this._handleConfirm());
            this.cancelBtn.addEventListener('click', () => this._closeModal());

            // Wiring de campos condicionais (showIf)
            this._setupConditionals();

            // Clica fora do modal para fechar
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this._closeModal();
            });

            // Tecla ESC para fechar
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.overlay.classList.contains('pc-visible')) {
                    this._closeModal();
                }
            });
        }

        _openModal() {
            this._clearErrors();
            this._updateConditionals();
            this.overlay.style.display = 'flex';
            // Força reflow para disparar a transição CSS
            this.overlay.offsetHeight;
            this.overlay.classList.add('pc-visible');

            // Foca no primeiro campo para acessibilidade
            const firstFocusable = this.overlay.querySelector('input, textarea, select, button');
            if (firstFocusable) firstFocusable.focus();
        }

        _closeModal() {
            this.overlay.classList.remove('pc-visible');
            setTimeout(() => {
                this.overlay.style.display = 'none';
            }, 260);
        }

        _handleConfirm() {
            if (!this._validateFields()) return;

            const properties = this._collectValues();
            const productId = this._getProductId();

            if (productId) {
                const storageKey = CONFIG.storagePrefix + productId + '_properties';
                try {
                    sessionStorage.setItem(storageKey, JSON.stringify(properties));
                } catch (e) {
                    console.warn('[ProductCustomizer] Erro ao salvar no sessionStorage:', e);
                }
            }

            const btn = this.currentButton;
            this.currentButton = null;
            this._closeModal();

            // Re-dispara o clique original após a animação de fechamento
            setTimeout(() => {
                if (btn) {
                    this._pendingClick = true;
                    btn.click();
                    this._pendingClick = false;
                }
            }, 270);
        }

        _getProductId() {
            if (!this.currentButton) return null;
            const acoes = this.currentButton.closest('.acoes-produto');
            return acoes ? acoes.getAttribute('data-produto-id') : null;
        }

        _setupConditionals() {
            const conditionalFields = CONFIG.fields.filter(f => f.showIf);
            if (conditionalFields.length === 0) return;

            const triggerIds = [...new Set(conditionalFields.map(f => f.showIf.field))];

            triggerIds.forEach(triggerId => {
                this.overlay.querySelectorAll(`[name="${triggerId}"]`).forEach(input => {
                    input.addEventListener('change', () => this._updateConditionals());
                });
            });
        }

        _updateConditionals() {
            CONFIG.fields.forEach(field => {
                if (!field.showIf) return;

                const container = this.overlay.querySelector(`.pc-field[data-field-id="${field.id}"]`);
                if (!container) return;

                const { field: triggerFieldId, value: triggerValue, values: triggerValues } = field.showIf;
                const currentValue = this._getFieldCurrentValue(triggerFieldId);

                let show = false;
                if (Array.isArray(triggerValues)) {
                    show = Array.isArray(currentValue)
                        ? currentValue.some(v => triggerValues.includes(v))
                        : triggerValues.includes(currentValue);
                } else {
                    show = currentValue === triggerValue;
                }

                container.classList.toggle('pc-field--hidden', !show);
            });
        }

        _getFieldCurrentValue(fieldId) {
            const fieldConfig = CONFIG.fields.find(f => f.id === fieldId);
            if (!fieldConfig) return '';

            if (fieldConfig.type === 'radio') {
                const checked = this.overlay.querySelector(`input[name="${fieldId}"]:checked`);
                return checked ? checked.value : '';
            } else if (fieldConfig.type === 'checkbox' && fieldConfig.options && fieldConfig.options.length > 0) {
                return [...this.overlay.querySelectorAll(`input[name="${fieldId}"]:checked`)].map(c => c.value);
            } else if (fieldConfig.type === 'checkbox') {
                const el = document.getElementById(`pc-field-${fieldId}`);
                return el ? el.checked : false;
            } else {
                const el = document.getElementById(`pc-field-${fieldId}`);
                return el ? el.value.trim() : '';
            }
        }

        _collectValues() {
            const values = {};

            CONFIG.fields.forEach(field => {
                // Ignora campos atualmente ocultos por condição showIf
                const container = this.overlay.querySelector(`.pc-field[data-field-id="${field.id}"]`);
                if (container && container.classList.contains('pc-field--hidden')) return;

                let value;
                if (field.type === 'radio') {
                    const checked = this.overlay.querySelector(`input[name="${field.id}"]:checked`);
                    value = checked ? checked.value : '';
                } else if (field.type === 'checkbox' && field.options && field.options.length > 0) {
                    const checked = [...this.overlay.querySelectorAll(`input[name="${field.id}"]:checked`)];
                    value = checked.map(c => c.value);
                } else if (field.type === 'checkbox') {
                    const el = document.getElementById(`pc-field-${field.id}`);
                    value = el ? el.checked : false;
                } else {
                    const el = document.getElementById(`pc-field-${field.id}`);
                    value = el ? el.value.trim() : '';
                }

                values[field.id] = { label: field.label, value };
            });

            return values;
        }

        _validateFields() {
            this._clearErrors();
            let valid = true;

            CONFIG.fields.forEach(field => {
                if (!field.required) return;

                // Ignora campos ocultos por condição showIf
                const container = this.overlay.querySelector(`.pc-field[data-field-id="${field.id}"]`);
                if (container && container.classList.contains('pc-field--hidden')) return;

                let hasValue = true;
                const errorEl = document.getElementById(`pc-error-${field.id}`);
                const inputEl = document.getElementById(`pc-field-${field.id}`);

                if (field.type === 'radio') {
                    hasValue = !!this.overlay.querySelector(`input[name="${field.id}"]:checked`);
                } else if (field.type === 'checkbox' && field.options && field.options.length > 0) {
                    hasValue = !!this.overlay.querySelector(`input[name="${field.id}"]:checked`);
                } else if (field.type === 'checkbox') {
                    hasValue = inputEl ? inputEl.checked : false;
                } else {
                    hasValue = inputEl ? inputEl.value.trim() !== '' : false;
                    if (inputEl) inputEl.classList.toggle('pc-error', !hasValue);
                }

                if (!hasValue) {
                    valid = false;
                    if (errorEl) {
                        errorEl.textContent = field.errorMessage || CONFIG.requiredMessage;
                        errorEl.classList.add('pc-show');
                    }
                }
            });

            return valid;
        }

        _clearErrors() {
            this.overlay.querySelectorAll('.pc-error').forEach(el => el.classList.remove('pc-error'));
            this.overlay.querySelectorAll('.pc-error-msg').forEach(el => {
                el.textContent = '';
                el.classList.remove('pc-show');
            });
        }

        // Escapa HTML para evitar XSS ao interpolar valores de configuração no DOM
        _esc(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        /** Abre o modal manualmente */
        open() {
            this._openModal();
        }

        /** Fecha o modal manualmente */
        close() {
            this._closeModal();
        }

        /** Atualiza configurações em tempo real */
        updateConfig(newConfig) {
            Object.assign(CONFIG, newConfig);
        }

        /** Remove o plugin completamente do DOM */
        destroy() {
            if (this.overlay) this.overlay.remove();
            const styles = document.getElementById('product-customizer-styles');
            if (styles) styles.remove();
        }

        /** Reinicializa o plugin */
        reinit() {
            this.destroy();
            this.init();
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================

    function initProductCustomizer() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.ProductCustomizer = new ProductCustomizer();
            });
        } else {
            window.ProductCustomizer = new ProductCustomizer();
        }
    }

    initProductCustomizer();

})();
