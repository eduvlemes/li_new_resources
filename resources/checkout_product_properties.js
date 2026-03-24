/**
 * Checkout Product Properties - Injeta propriedades personalizadas de produtos no checkout
 *
 * Na página de checkout (.pagina-carrinho.checkout), lê as chaves *_properties
 * do sessionStorage (salvas pelo Product Customizer) e injeta os dados formatados
 * no campo [name="cliente_obs"]. Caso o campo não exista, cria um input oculto.
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.CheckoutProductPropertiesConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        active: true,

        // Seletor da página onde o script deve agir
        pageSelector: '.pagina-carrinho.checkout',

        // Sufixo das chaves no sessionStorage criadas pelo Product Customizer
        storageKeySuffix: '_properties',

        // Seletor do campo de observação do checkout onde o texto será injetado.
        // Se não encontrado, um input[type="hidden"] é criado dentro do formulário.
        obsFieldSelector: '[name="cliente_obs"]',

        // Texto de cabeçalho inserido antes das respostas de cada produto
        blockPrefix: '[ Personalização do produto ]\n',

        // Formato de cada linha — use {label} e {value} como marcadores
        lineFormat: '{label}: {value}',

        // Separador entre os campos do mesmo produto
        fieldSeparator: '\n',

        // Separador entre blocos de produtos diferentes
        productSeparator: '\n---\n',

        // Texto exibido quando um checkbox booleano está marcado como verdadeiro
        booleanTrue: 'Sim',

        // Texto exibido quando um checkbox booleano está marcado como falso
        booleanFalse: 'Não'
    };

    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.CheckoutProductPropertiesConfig && typeof window.CheckoutProductPropertiesConfig === 'object') {
        Object.assign(CONFIG, window.CheckoutProductPropertiesConfig);
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    class CheckoutProductProperties {
        constructor() {
            this.init();
        }

        init() {
            if (!CONFIG.active) return;
            if (!document.querySelector(CONFIG.pageSelector)) return;

            this._inject();
        }

        // Lê todas as entradas *_properties do sessionStorage
        _readAll() {
            const result = {};

            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (!key || !key.endsWith(CONFIG.storageKeySuffix)) continue;

                try {
                    const data = JSON.parse(sessionStorage.getItem(key));
                    if (data && typeof data === 'object') {
                        const productId = key.slice(0, -CONFIG.storageKeySuffix.length);
                        result[productId] = data;
                    }
                } catch (_) {
                    // Ignora entradas malformadas
                }
            }

            return result;
        }

        // Converte os dados de um campo para string legível
        _formatValue(value) {
            if (Array.isArray(value)) {
                return value.filter(v => v !== '').join(', ');
            }
            if (typeof value === 'boolean') {
                return value ? CONFIG.booleanTrue : CONFIG.booleanFalse;
            }
            return String(value ?? '');
        }

        // Monta o texto completo de todos os produtos
        _buildText(allProperties) {
            const blocks = [];

            Object.entries(allProperties).forEach(([, fields]) => {
                const lines = [];

                Object.entries(fields).forEach(([, fieldData]) => {
                    const label = fieldData.label || '';
                    const formatted = this._formatValue(fieldData.value);

                    // Ignora campos vazios ou não respondidos
                    if (formatted === '' || formatted === CONFIG.booleanFalse) return;

                    lines.push(
                        CONFIG.lineFormat
                            .replace('{label}', label)
                            .replace('{value}', formatted)
                    );
                });

                if (lines.length > 0) {
                    blocks.push(CONFIG.blockPrefix + lines.join(CONFIG.fieldSeparator));
                }
            });

            return blocks.join(CONFIG.productSeparator);
        }

        _inject() {
            const allProperties = this._readAll();
            if (Object.keys(allProperties).length === 0) return;

            const text = this._buildText(allProperties);
            if (!text) return;

            const obsField = document.querySelector(CONFIG.obsFieldSelector);

            if (obsField) {
                // Concatena ao valor existente (não sobrescreve o que o cliente já digitou)
                const existing = obsField.value.trim();
                obsField.value = existing ? existing + '\n' + text : text;
            } else {
                // Cria um input oculto como fallback
                const form = document.querySelector('form');
                if (!form) return;

                // Evita duplicação em chamadas múltiplas
                const existingHidden = form.querySelector('input[name="cliente_obs"][data-pc-injected]');
                if (existingHidden) {
                    existingHidden.value = text;
                    return;
                }

                const hidden = document.createElement('input');
                hidden.type = 'hidden';
                hidden.name = 'cliente_obs';
                hidden.value = text;
                hidden.setAttribute('data-pc-injected', 'true');
                form.appendChild(hidden);
            }
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        /** Força a reinjeção dos dados (útil se o DOM foi recarregado) */
        reinject() {
            this._inject();
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================

    function initCheckoutProductProperties() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.CheckoutProductProperties = new CheckoutProductProperties();
            });
        } else {
            window.CheckoutProductProperties = new CheckoutProductProperties();
        }
    }

    initCheckoutProductProperties();

})();
