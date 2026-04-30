/**
 * grid Purchase - Compra em grid para Loja Integrada
 * Exibe tabela de variações (tamanho × cor) com controles de quantidade
 * e adição múltipla ao carrinho em sequência.
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.gridPurchaseConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        active: true,

        // Ativa logs detalhados no console (desativar em produção final)
        debug: true,

        // Textos da interface
        unavailableText: 'Indisponível',
        addToCartText: 'Adicionar à sacola',
        addingText: 'Adicionando...',
        addedText: '✓ Adicionado!',
        totalLabel: 'Total:',
        summaryTitle: 'Itens selecionados',
        priceUnit: '/un',

        // Ação após todos os itens serem adicionados ao carrinho
        // 'redirect' → redireciona para /carrinho | 'none' → permanece na página
        afterAdd: 'redirect',

        // Onde inserir o widget na página
        insertSelector: '.atributos',
        insertMethod: 'beforebegin', // 'beforeend' | 'afterbegin' | 'beforebegin' | 'afterend'

        // Limitador de quantidade por produto pai
        // Cada entrada: { id: string, text: string, min: int, max: int }
        //   id   → ID do produto pai (corresponde a window.PRODUTO_ID)
        //   text → Mensagem exibida na notificação de limite
        //   min  → Quantidade mínima exigida (0 = sem mínimo)
        //   max  → Quantidade máxima permitida no total do carrinho
        quantityLimiter: [],

        // Cores
        colors: {
            primary: '#3057a8',
            headerBg: '#f5f5f5',
            border: '#dde0e5',
            unavailableText: '#bbb',
            priceColor: '#444',
            buttonText: '#ffffff',
            rowHeader: '#555',
            totalBg: '#f5f5f5',
            summaryBg: '#fafafa',
            selectedCell: 'rgba(48, 87, 168, 0.06)',
            successBg: '#22c55e',
        }
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.gridPurchaseConfig && typeof window.gridPurchaseConfig === 'object') {
        Object.assign(CONFIG, window.gridPurchaseConfig);

        // Mescla cores separadamente para permitir personalização parcial
        if (window.gridPurchaseConfig.colors && typeof window.gridPurchaseConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.gridPurchaseConfig.colors);
        }
    }

    // ── Helper de debug ──────────────────────────────────────────────────
    function log(...args) {
        if (CONFIG.debug) console.log('[gridPurchase]', ...args);
    }

    // ── Helper de texto do limitador ────────────────────────────────────
    // type: 'min' | 'max'
    function getLimiterText(limiter, type) {
        if (limiter.text) return limiter.text;
        if (type === 'min') return 'Mínimo: ' + limiter.min + ' unidade' + (limiter.min !== 1 ? 's' : '');
        return 'Máximo: ' + limiter.max + ' unidade' + (limiter.max !== 1 ? 's' : '');
    }

    // ======
    // EDITAR AQUI — Comportamento ao detectar violação de limite no carrinho
    // Parâmetros: limiter { id, text, min, max }, cartQty (quantidade atual no carrinho), productName (nome do produto no carrinho)
    // ======
    let onLimitViolation = function (limiter, cartQty, productName) {
        log('onLimitViolation →', { limiter, cartQty, productName });
        // Injeta CSS do aviso (apenas na página do carrinho)
        if (!document.getElementById('gp-cart-limit-warning-style')) {
            const style = document.createElement('style');
            style.id = 'gp-cart-limit-warning-style';
            style.textContent = '#gp-cart-limit-warning{background:#fef3c7;color:#78350f;border:1px solid #fbbf24;border-radius:0px;padding:12px 16px;font-size:14px;font-weight:500;margin:0px 0;line-height:1.5}';
            document.head.appendChild(style);
        }
        // Exibe aviso acima da lista do carrinho (acumula múltiplas violações no mesmo bloco)
        const violationType = cartQty > limiter.max ? 'max' : 'min';
        const msgText = getLimiterText(limiter, violationType);
        let warning = document.getElementById('gp-cart-limit-warning');
        if (!warning) {
            warning = document.createElement('div');
            warning.id = 'gp-cart-limit-warning';
            const target = document.querySelector('.tabela-carrinho');
            if (target) {
                target.insertAdjacentElement('beforebegin', warning);
            } else {
                log('onLimitViolation: .tabela-carrinho não encontrada, inserindo no início do body');
                document.body.insertAdjacentElement('afterbegin', warning);
            }
            log('onLimitViolation: aviso criado no DOM');
        } else {
            // Separador entre múltiplas violações
            warning.appendChild(document.createElement('br'));
        }
        if (productName) {
            const strong = document.createElement('strong');
            strong.textContent = productName;
            warning.appendChild(strong);
            warning.appendChild(document.createTextNode(': ' + msgText));
        } else {
            warning.appendChild(document.createTextNode(msgText));
        }
        log('onLimitViolation: mensagem adicionada =', msgText);
        // Remove o botão de finalizar compra
        document.querySelectorAll(
            '.botao.principal.grande'
        ).forEach(function (el) {
            el.style.display = 'none';
        });
    };

    // Permite sobrescrever via window.gridPurchaseConfig.onLimitViolation
    if (window.gridPurchaseConfig && typeof window.gridPurchaseConfig.onLimitViolation === 'function') {
        onLimitViolation = window.gridPurchaseConfig.onLimitViolation;
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    const CSS_STYLES = `
        <style id="grid-purchase-styles">
            #grid-purchase-container {
                font-family: inherit;
                font-size: 14px;
                margin: 24px 0;
                border: 1px solid ${CONFIG.colors.border};
                border-radius: 6px;
                overflow: hidden;
                background: #fff;
                padding:0;
            }

            /* ── Tabela ── */
            .gp-table-wrapper {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }

            .gp-table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                font-size: 12px;
            }

            .gp-table th,
            .gp-table td {
                border: 1px solid ${CONFIG.colors.border};
                padding: 5px 3px;
                text-align: center;
                vertical-align: middle;
            }

            /* ── Coluna de cabeçalho de linha com sticky no scroll horizontal ── */
            .gp-th-corner,
            .gp-td-row-header {
                position: sticky;
                left: 0;
                z-index: 2;
            }

            .gp-th-corner {
                background: ${CONFIG.colors.headerBg};
                min-width: 40px;
                position: sticky;
                left: 0;
                z-index: 3;
                overflow: hidden;
            }

            .gp-th-corner::after {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(
                    to top right,
                    transparent calc(50% - 0.5px),
                    ${CONFIG.colors.border} calc(50% - 0.5px),
                    ${CONFIG.colors.border} calc(50% + 0.5px),
                    transparent calc(50% + 0.5px)
                );
                pointer-events: none;
            }

            .gp-corner-col-label {
                display: block;
                position: absolute;
                top: 3px;
                right: 4px;
                font-size: 9px;
                font-weight: 600;
                color: #888;
                line-height: 1;
            }

            .gp-corner-row-label {
                display: block;
                position: absolute;
                bottom: 3px;
                left: 4px;
                font-size: 9px;
                font-weight: 600;
                color: #888;
                line-height: 1;
            }

            /* Corner para produto com uma única opção de variação */
            .gp-th-corner.gp-single {
                text-align: center;
                font-size: 10px;
                font-weight: 700;
                color: #666;
                overflow: visible;
            }

            .gp-th-corner.gp-single::after {
                display: none;
            }

            .gp-th-col {
                background: ${CONFIG.colors.headerBg};
                font-weight: 600;
                font-size: 11px;
                white-space: nowrap;
                color: #333;
                min-width: 72px;
            }

            .gp-td-row-header {
                background: ${CONFIG.colors.headerBg};
                font-weight: 600;
                font-size: 13px;
                color: ${CONFIG.colors.rowHeader};
                white-space: nowrap;
                min-width: 40px;
            }

            /* ── Célula indisponível ── */
            .gp-cell-unavailable {
                background: #fafafa;
            }

            .gp-unavailable {
                color: ${CONFIG.colors.unavailableText};
                font-size: 11px;
                font-style: italic;
            }

            /* ── Célula disponível ── */
            .gp-cell-available {
                padding: 4px 2px;
                transition: background 0.15s;
            }

            .gp-cell-available.gp-cell-selected {
                background: ${CONFIG.colors.selectedCell};
            }

            .gp-price {
                display: block;
                font-size: 10px;
                color: ${CONFIG.colors.priceColor};
                margin-bottom: 3px;
                white-space: nowrap;
            }

            /* ── Controle de quantidade ── */
            .gp-qty-control {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 2px;
            }

            .gp-qty-btn {
                width: 20px;
                height: 20px;
                border: 1px solid ${CONFIG.colors.border};
                background: #fff;
                color: #444;
                font-size: 13px;
                font-weight: 700;
                line-height: 1;
                cursor: pointer;
                border-radius: 3px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.12s, color 0.12s, border-color 0.12s;
                user-select: none;
                flex-shrink: 0;
            }

            .gp-qty-btn:hover {
                background: ${CONFIG.colors.primary};
                color: #fff;
                border-color: ${CONFIG.colors.primary};
            }

            .gp-qty-btn:disabled {
                opacity: 0.35;
                cursor: not-allowed;
            }

            .gp-qty-btn:hover:disabled {
                background: #fff;
                color: #444;
                border-color: ${CONFIG.colors.border};
            }

            .gp-qty-value {
                min-width: 16px;
                text-align: center;
                font-size: 12px;
                font-weight: 600;
                color: #222;
            }

            /* ── Resumo de seleção ── */
            #grid-purchase-summary:not(:empty) {
                border-top: 1px solid ${CONFIG.colors.border};
            }

            .gp-summary {
                background: ${CONFIG.colors.summaryBg};
                padding: 12px 16px;
            }

            .gp-summary-title {
                font-size: 11px;
                font-weight: 700;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                margin-bottom: 9px;
            }

            .gp-summary-list {
                list-style: none;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .gp-summary-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: #333;
                padding: 3px 0;
                border-bottom: 1px solid #eee;
            }

            .gp-summary-item:last-child {
                border-bottom: none;
            }

            .gp-summary-label {
                flex: 1;
                font-weight: 500;
            }

            .gp-summary-qty {
                color: #777;
                white-space: nowrap;
                font-size: 12px;
            }

            .gp-summary-subtotal {
                font-weight: 600;
                white-space: nowrap;
                min-width: 72px;
                text-align: right;
                color: #222;
            }

            /* ── Rodapé (total + botão) ── */
            .gp-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 12px 16px;
                border-top: 1px solid ${CONFIG.colors.border};
                background: ${CONFIG.colors.totalBg};
            }

            .gp-total {
                display: flex;
                align-items: baseline;
                gap: 8px;
                flex-shrink: 0;
            }

            .gp-total-label {
                font-size: 13px;
                color: #777;
            }

            .gp-total-value {
                font-size: 22px;
                font-weight: 700;
                color: #111;
            }

            .gp-btn-add {
                background: ${CONFIG.colors.primary};
                color: ${CONFIG.colors.buttonText};
                border: none;
                border-radius: 4px;
                padding: 12px 28px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: filter 0.15s, opacity 0.15s, background 0.2s;
                white-space: nowrap;
            }

            .gp-btn-add:hover:not(:disabled) {
                filter: brightness(1.1);
            }

            .gp-btn-add:disabled {
                opacity: 0.45;
                cursor: not-allowed;
            }

            .gp-btn-add.gp-btn-success {
                background: ${CONFIG.colors.successBg};
            }

            @media (max-width: 600px) {
                .gp-table {
                    table-layout: auto;
                }

                .gp-table th,
                .gp-table td {
                    padding: 5px 0;
                }

                /* Sombra na coluna sticky para indicar scroll */
                .gp-th-corner,
                .gp-td-row-header {
                    box-shadow: 2px 0 4px rgba(0,0,0,0.08);
                }

                .gp-th-col {
                    min-width: 72px;
                    font-size: 10px;
                }

                .gp-th-corner {
                    min-width: 26px;
                }

                /* Oculta o texto da coluna de cabeçalho de linha */
                .gp-td-row-header {
                    min-width: 20px;
                    font-size: 11px;
                    
                }

                /* Mantém o número visível via ::before com font-size normal */
                .gp-th-corner *{font-size:0}

                .gp-cell-available {
                    min-width: 72px;
                }

                .gp-unavailable {
                    font-size: 9px;
                }

                .gp-footer {
                    flex-direction: column;
                    align-items: stretch;
                }

                .gp-btn-add {
                    text-align: center;
                }

                .gp-total {
                    justify-content: space-between;
                }
            }

            /* ── Notificação de limite na página de produto ── */
            .gp-limit-notice:not(:empty) {
                background: #fffbeb;
                color: #92400e;
                border-bottom: 1px solid ${CONFIG.colors.border};
                padding: 8px 14px;
                font-size: 13px;
                font-weight: 500;
                line-height: 1.4;
            }

        </style>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class gridPurchase {
        constructor() {
            this.productData = null;
            this.quantities = {}; // { [skuId]: qty }
            this.activeLimiter = null;
            this.cartLimiterQty = 0;
            this.init();
        }

        init() {
            if (!CONFIG.active) { log('init: inativo (active=false)'); return; }
            if (typeof $ === 'undefined') { log('init: jQuery não disponível'); return; }

            const pagina = document.body.className || '(sem classe no body)';
            log('init: página detectada →', pagina);
            log('init: window.PRODUTO_ID =', window.PRODUTO_ID, '| window.LOJA_ID =', window.LOJA_ID);

            // Verifica limites em todas as páginas (produto, carrinho, etc.)
            // Aguarda window.load + mínimo de 1s para garantir que o sessionStorage esteja populado
            if (CONFIG.quantityLimiter.length > 0) {
                const waitLoad = new Promise(resolve => {
                    if (document.readyState === 'complete') {
                        resolve();
                    } else {
                        window.addEventListener('load', resolve, { once: true });
                    }
                });
                const waitMin = new Promise(resolve => setTimeout(resolve, 1000));
                Promise.all([waitLoad, waitMin]).then(() => {
                    log('init: verificando limites do carrinho...');
                    this.checkCartLimits();
                });
            } else {
                log('init: quantityLimiter vazio, verificação pulada');
            }

            // Widget de grade: apenas na página de produto sem preço restrito
            if ($('.pagina-produto').length > 0 && $('.produto .preco-restrito').length === 0) {
                log('init: página de produto sem restrição — carregando fetchProduct');
                this.fetchProduct();
            } else {
                log('init: fora da página de produto ou produto com preço restrito — grid não renderizado');
            }
        }

        fetchProduct() {
            const productId = window.PRODUTO_ID;
            if (!productId) { log('fetchProduct: PRODUTO_ID não definido, abortando'); return; }

            const lojaId = window.LOJA_ID || '';
            const url = '/_search?an=' + encodeURIComponent(lojaId) + '&filters=product_ids:' + encodeURIComponent(productId);
            log('fetchProduct: requisição →', url);

            fetch(url)
                .then(r => r.json())
                .then(data => {
                    if (!data || !data.products || !data.products.length) {
                        log('fetchProduct: nenhum produto retornado pela API');
                        return;
                    }
                    log('fetchProduct: produto recebido →', data.products[0].name, '| SKUs:', data.products[0].skus?.length);
                    this.productData = this.parseProductData(data.products[0]);
                    if (!this.productData) { log('fetchProduct: parseProductData retornou null (sem opções?)'); return; }
                    this.activeLimiter = this.getActiveLimiter();
                    this.cartLimiterQty = this.activeLimiter ? this.getCartQuantity(this.activeLimiter.id) : 0;
                    log('fetchProduct: activeLimiter →', this.activeLimiter);
                    log('fetchProduct: cartLimiterQty =', this.cartLimiterQty);
                    this.injectStyles();
                    this.render();
                    this.setupEventListeners();
                    this.updatePlusButtons();
                })
                .catch(err => {
                    console.warn('[gridPurchase] Erro ao buscar produto:', err);
                });
        }

        parseProductData(product) {
            // Ordena as opções pelo campo option.order (crescente)
            const options = (product.options || []).slice().sort((a, b) => a.option.order - b.option.order);
            if (!options.length) return null;

            const rowOption = options[0];
            const colOption = options.length > 1 ? options[1] : null;

            // Ordena os valores de cada opção pelo campo order (crescente)
            const rows = rowOption.values.slice().sort((a, b) => a.order - b.order);
            const cols = colOption
                ? colOption.values.slice().sort((a, b) => a.order - b.order)
                : [{ id: '_single_', name: '' }];

            // Constrói mapa de SKUs: skuMap[rowValueId][colValueId] = sku
            const skuMap = {};
            const rowOptionId = rowOption.option.id;
            const colOptionId = colOption ? colOption.option.id : null;

            for (const sku of product.skus) {
                let rowValueId = null;
                let colValueId = colOptionId ? null : '_single_';

                for (const variation of sku.variations) {
                    if (variation.option.id === rowOptionId) rowValueId = variation.value.id;
                    if (colOptionId && variation.option.id === colOptionId) colValueId = variation.value.id;
                }

                if (rowValueId && colValueId) {
                    if (!skuMap[rowValueId]) skuMap[rowValueId] = {};
                    skuMap[rowValueId][colValueId] = sku;
                    this.quantities[sku.id] = 0;
                }
            }

            return { product, rows, cols, skuMap, rowOption, colOption };
        }

        injectStyles() {
            if (!document.getElementById('grid-purchase-styles')) {
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            }
        }

        render() {
            const existing = document.getElementById('grid-purchase-container');
            if (existing) existing.remove();

            const html = `
                <div id="grid-purchase-container">
                    <div id="gp-limit-notice" class="gp-limit-notice"></div>
                    <div class="gp-table-wrapper">
                        ${this.buildGridHTML()}
                    </div>
                    <div id="grid-purchase-summary"></div>
                    <div class="gp-footer">
                        <div class="gp-total">
                            <span class="gp-total-label">${CONFIG.totalLabel}</span>
                            <span class="gp-total-value" id="gp-total-value">R$ 0,00</span>
                        </div>
                        <button class="gp-btn-add" id="grid-purchase-add-btn" disabled>
                            ${CONFIG.addToCartText}
                        </button>
                    </div>
                </div>
            `;

            const insertTarget = document.querySelector(CONFIG.insertSelector);
            if (insertTarget) {
                insertTarget.insertAdjacentHTML(CONFIG.insertMethod, html);
            } else {
                document.body.insertAdjacentHTML('beforeend', html);
            }
        }

        buildGridHTML() {
            const { rows, cols, skuMap, rowOption, colOption } = this.productData;
            const rowLabel = rowOption.option.display_name || rowOption.option.name;
            const colLabel = colOption ? (colOption.option.display_name || colOption.option.name) : '';

            let html = '<table class="gp-table"><thead><tr>';
            if (colOption) {
                html += `<th class="gp-th-corner" aria-label="${this.escapeHTML(rowLabel)} / ${this.escapeHTML(colLabel)}">` +
                    `<span class="gp-corner-col-label">${this.escapeHTML(colLabel)}</span>` +
                    `<span class="gp-corner-row-label">${this.escapeHTML(rowLabel)}</span>` +
                    `</th>`;
                for (const col of cols) {
                    html += `<th class="gp-th-col">${this.escapeHTML(col.name)}</th>`;
                }
            } else {
                // Produto com única variação: cabeçalho simples (OpçãoNome | Qtd.)
                html += `<th class="gp-th-corner gp-single">${this.escapeHTML(rowLabel)}</th>`;
                html += '<th class="gp-th-col">Qtd.</th>';
            }
            html += '</tr></thead><tbody>';

            for (const row of rows) {
                html += `<tr><td class="gp-td-row-header" data-row-label="${this.escapeHTML(row.name)}">${this.escapeHTML(row.name)}</td>`;

                for (const col of cols) {
                    const sku = skuMap[row.id] && skuMap[row.id][col.id];

                    if (!sku || !sku.available) {
                        html += `<td class="gp-cell gp-cell-unavailable">` +
                            `<span class="gp-unavailable">${CONFIG.unavailableText}</span></td>`;
                    } else {
                        const maxQty = sku.inventory
                            ? (sku.inventory.available_quantity || 0)
                            : 999;
                        html += `<td class="gp-cell gp-cell-available" data-sku="${sku.id}" data-max="${maxQty}">` +
                            `<span class="gp-price">${this.formatPrice(this.getSkuPrice(sku))}${CONFIG.priceUnit}</span>` +
                            `<div class="gp-qty-control">` +
                            `<button class="gp-qty-btn gp-qty-minus" data-sku="${sku.id}" aria-label="Diminuir" disabled>−</button>` +
                            `<span class="gp-qty-value" id="gp-qty-${sku.id}">0</span>` +
                            `<button class="gp-qty-btn gp-qty-plus" data-sku="${sku.id}" aria-label="Aumentar">+</button>` +
                            `</div></td>`;
                    }
                }
                html += '</tr>';
            }

            html += '</tbody></table>';
            return html;
        }

        setupEventListeners() {
            const container = document.getElementById('grid-purchase-container');
            if (!container) return;

            container.addEventListener('click', e => {
                const btn = e.target.closest('.gp-qty-btn');
                if (!btn || btn.disabled) return;

                const skuId = btn.dataset.sku;
                if (!skuId) return;

                const cell = btn.closest('.gp-cell-available');
                const maxQty = cell ? (parseInt(cell.dataset.max, 10) || 999) : 999;

                if (btn.classList.contains('gp-qty-plus')) {
                    const newQty = Math.min(maxQty, (this.quantities[skuId] || 0) + 1);
                    this.quantities[skuId] = newQty;
                } else if (btn.classList.contains('gp-qty-minus')) {
                    this.quantities[skuId] = Math.max(0, (this.quantities[skuId] || 0) - 1);
                }

                this.updateCellUI(skuId, maxQty);
                this.updateSummary();
            });

            const addBtn = document.getElementById('grid-purchase-add-btn');
            if (addBtn) {
                addBtn.addEventListener('click', () => this.handleAddToCart(addBtn));
            }
        }

        updateCellUI(skuId, maxQty) {
            const qty = this.quantities[skuId] || 0;

            // Atualiza display de quantidade
            const qtyEl = document.getElementById('gp-qty-' + skuId);
            if (qtyEl) qtyEl.textContent = qty;

            // Habilita/desabilita botões
            const cell = document.querySelector(`.gp-cell-available[data-sku="${skuId}"]`);
            if (cell) {
                const minusBtn = cell.querySelector('.gp-qty-minus');
                const plusBtn = cell.querySelector('.gp-qty-plus');

                if (minusBtn) minusBtn.disabled = qty <= 0;
                if (plusBtn) plusBtn.disabled = qty >= maxQty;

                // Destaca célula quando selecionada
                cell.classList.toggle('gp-cell-selected', qty > 0);
            }

            this.updatePlusButtons();
        }

        getSelectedItems() {
            const items = [];
            const { rows, cols, skuMap } = this.productData;

            for (const row of rows) {
                for (const col of cols) {
                    const sku = skuMap[row.id] && skuMap[row.id][col.id];
                    if (sku && (this.quantities[sku.id] || 0) > 0) {
                        items.push({ skuId: sku.id, qty: this.quantities[sku.id], sku, row, col });
                    }
                }
            }
            return items;
        }

        updateSummary() {
            const items = this.getSelectedItems();
            const summaryEl = document.getElementById('grid-purchase-summary');
            const totalEl = document.getElementById('gp-total-value');
            const addBtn = document.getElementById('grid-purchase-add-btn');

            if (!summaryEl) return;

            if (!items.length) {
                summaryEl.innerHTML = '';
                if (totalEl) totalEl.textContent = 'R$ 0,00';
                if (addBtn) addBtn.disabled = true;
                return;
            }

            let total = 0;
            let html = '<div class="gp-summary">';
            if (CONFIG.summaryTitle) {
                html += `<div class="gp-summary-title">${CONFIG.summaryTitle}</div>`;
            }
            html += '<ul class="gp-summary-list">';

            for (const item of items) {
                const subtotal = item.qty * this.getSkuPrice(item.sku);
                total += subtotal;

                const label = this.productData.colOption
                    ? `${this.escapeHTML(item.row.name)} / ${this.escapeHTML(item.col.name)}`
                    : this.escapeHTML(item.row.name);

                html += `<li class="gp-summary-item">` +
                    `<span class="gp-summary-label">${label}</span>` +
                    `<span class="gp-summary-qty">${item.qty} un.</span>` +
                    `<span class="gp-summary-subtotal">${this.formatPrice(subtotal)}</span>` +
                    `</li>`;
            }

            html += '</ul></div>';
            summaryEl.innerHTML = html;

            if (totalEl) totalEl.textContent = this.formatPrice(total);
            if (addBtn) {
                const totalSelected = this.getTotalSelectedQty();
                const minBlocked = this.activeLimiter && this.activeLimiter.min > 0 && totalSelected < this.activeLimiter.min;
                addBtn.disabled = minBlocked;
            }
            this.updatePlusButtons();
        }

        handleAddToCart(btnEl) {
            const items = this.getSelectedItems();
            if (!items.length) return;

            // Bloqueia se não atingiu a quantidade mínima
            if (this.activeLimiter && this.activeLimiter.min > 0 && this.getTotalSelectedQty() < this.activeLimiter.min) {
                const noticeEl = document.getElementById('gp-limit-notice');
                if (noticeEl) noticeEl.textContent = getLimiterText(this.activeLimiter, 'min');
                return;
            }

            btnEl.disabled = true;
            btnEl.classList.remove('gp-btn-success');
            btnEl.textContent = CONFIG.addingText;

            this.addItemsSequentially(items, 0, btnEl);
        }

        addItemsSequentially(items, index, btnEl) {
            // Todos os itens foram processados
            if (index >= items.length) {
                btnEl.textContent = CONFIG.addedText;
                btnEl.classList.add('gp-btn-success');

                if (CONFIG.afterAdd === 'redirect') {
                    setTimeout(() => { window.location.href = '/carrinho/index'; }, 1000);
                }
                return;
            }

            const item = items[index];
            const url = '/carrinho/produto/' + encodeURIComponent(item.skuId) +
                '/adicionar/' + encodeURIComponent(item.qty);

            $.get(url, response => {
                if (response && response.status === 'sucesso') {
                    try {
                        if (typeof sendMetrics === 'function') {
                            const MS = {
                                id: response.carrinho_id,
                                items: [{ item_id: response.produto_id, quantity: item.qty }]
                            };
                            const L = sendMetrics({ type: 'event', name: 'add_to_cart', data: MS });
                            $(document).trigger('li_change_quantity', [L, MS]);
                        }
                    } catch (e) { /* métricas não disponíveis */ }
                }
                this.addItemsSequentially(items, index + 1, btnEl);
            }).fail(() => {
                // Continua mesmo em caso de erro individual
                this.addItemsSequentially(items, index + 1, btnEl);
            });
        }

        // ── Limitador de quantidade ──────────────────────────────────────────

        /**
         * Retorna a entrada de quantityLimiter correspondente ao produto atual
         * (window.PRODUTO_ID), ou null se não houver configuração.
         */
        getActiveLimiter() {
            if (!CONFIG.quantityLimiter.length) return null;
            const pid = String(window.PRODUTO_ID || '');
            const found = CONFIG.quantityLimiter.find(l => String(l.id) === pid) || null;
            log('getActiveLimiter: PRODUTO_ID =', pid, '| match →', found);
            return found;
        }

        /**
         * Lê o sessionStorage 'carrinho_minicart' e retorna a quantidade total
         * de itens cujo parentId (prioridade) ou id corresponda a limiterId.
         */
        getCartQuantity(limiterId) {
            try {
                const raw = sessionStorage.getItem('carrinho_minicart');
                if (!raw) { log('getCartQuantity: sessionStorage[carrinho_minicart] vazio'); return 0; }
                const data = JSON.parse(raw);
                const items = data && data.carrinho && Array.isArray(data.carrinho.items) ? data.carrinho.items
                            : Array.isArray(data && data.items) ? data.items : null;
                if (!items) {
                    log('getCartQuantity: estrutura inválida —', data);
                    return 0;
                }
                log('getCartQuantity: total de itens no carrinho =', items.length);
                const key = String(limiterId);
                let total = 0;
                for (const item of items) {
                    // parentId tem prioridade; fallback para id
                    const usedField = (item.parentId != null && item.parentId !== '') ? 'parentId' : 'id';
                    const matchKey = usedField === 'parentId' ? String(item.parentId) : String(item.id);
                    log('getCartQuantity: item →', { id: item.id, parentId: item.parentId, usedField, matchKey, quantity: item.quantity, match: matchKey === key });
                    if (matchKey === key) {
                        total += Number(item.quantity) || 0;
                    }
                }
                log('getCartQuantity: total para limiterId', key, '=', total);
                return total;
            } catch (e) {
                console.warn('[gridPurchase] getCartQuantity erro:', e);
                return 0;
            }
        }

        /**
         * Lê o sessionStorage 'carrinho_minicart' e retorna o nome do produto
         * cujo parentId (prioridade) ou id corresponda a limiterId.
         */
        getCartProductName(limiterId) {
            try {
                const raw = sessionStorage.getItem('carrinho_minicart');
                if (!raw) return '';
                const data = JSON.parse(raw);
                const items = data && data.carrinho && Array.isArray(data.carrinho.items) ? data.carrinho.items
                            : Array.isArray(data && data.items) ? data.items : null;
                if (!items) return '';
                const key = String(limiterId);
                for (const item of items) {
                    const usedField = (item.parentId != null && item.parentId !== '') ? 'parentId' : 'id';
                    const matchKey = usedField === 'parentId' ? String(item.parentId) : String(item.id);
                    if (matchKey === key) return item.name || '';
                }
            } catch (e) { /* silencioso */ }
            return '';
        }

        /**
         * Verifica todos os limitadores contra o carrinho (sessionStorage).
         * - Na pagina-carrinho: chama onLimitViolation() para cada violação.
         * - Na pagina-produto: não redireciona — a grade bloqueia interativamente.
         * - Em qualquer outra página: redireciona para /carrinho/index.
         */
        checkCartLimits() {
            log('checkCartLimits: iniciando para', CONFIG.quantityLimiter.length, 'limitador(es)');
            const violations = [];
            for (const limiter of CONFIG.quantityLimiter) {
                const cartQty = this.getCartQuantity(limiter.id);
                if (cartQty === 0) { log('checkCartLimits: limiter id=' + limiter.id + ' — produto não está no carrinho, ignorado'); continue; }
                const overMax = cartQty > limiter.max;
                const underMin = limiter.min > 0 && cartQty < limiter.min;
                log('checkCartLimits: limiter id=' + limiter.id, { cartQty, min: limiter.min, max: limiter.max, overMax, underMin });
                if (overMax || underMin) {
                    const productName = this.getCartProductName(limiter.id);
                    const violationType = overMax ? 'max' : 'min';
                    // Garante que limiter.text sempre esteja preenchido (inclusive para funções onLimitViolation customizadas)
                    const resolvedLimiter = limiter.text ? limiter : Object.assign({}, limiter, { text: getLimiterText(limiter, violationType) });
                    log('checkCartLimits: violação →', { violationType, text: resolvedLimiter.text, cartQty, productName });
                    violations.push({ limiter: resolvedLimiter, cartQty, productName });
                }
            }
            log('checkCartLimits: violações encontradas =', violations.length);
            if (!violations.length) return;

            if ($('.pagina-carrinho').length > 0) {
                log('checkCartLimits: estamos no carrinho — chamando onLimitViolation para cada violação');
                for (const { limiter, cartQty, productName } of violations) {
                    onLimitViolation(limiter, cartQty, productName);
                }
            } else if ($('.pagina-produto').length > 0) {
                // Na página de produto a grade já enforça o limite via updatePlusButtons()
                log('checkCartLimits: violação detectada na página de produto — grid bloqueará interativamente, sem redirect');
            } else {
                log('checkCartLimits: fora do carrinho e fora do produto — redirecionando para /carrinho/index');
                window.location.href = '/carrinho/index';
            }
        }

        /** Soma total de unidades selecionadas na grade. */
        getTotalSelectedQty() {
            return Object.values(this.quantities).reduce((s, v) => s + v, 0);
        }

        /**
         * Habilita/desabilita botões "+" com base no limite global restante
         * e atualiza o texto do aviso #gp-limit-notice.
         */
        updatePlusButtons() {
            if (!this.activeLimiter) return;
            const totalSelected = this.getTotalSelectedQty();
            // Na página de produto o limite é sempre relativo ao max absoluto (ignora o que já está no carrinho)
            const remaining = Math.max(0, this.activeLimiter.max - totalSelected);
            const minBlocked = this.activeLimiter.min > 0 && totalSelected < this.activeLimiter.min;
            log('updatePlusButtons:', { totalSelected, max: this.activeLimiter.max, remaining, minBlocked });

            const container = document.getElementById('grid-purchase-container');
            if (!container) return;

            container.querySelectorAll('.gp-cell-available').forEach(cell => {
                const skuId = cell.dataset.sku;
                const cellMax = parseInt(cell.dataset.max, 10) || 999;
                const cellQty = this.quantities[skuId] || 0;
                const plusBtn = cell.querySelector('.gp-qty-plus');
                if (plusBtn) {
                    plusBtn.disabled = remaining <= 0 || cellQty >= cellMax;
                }
            });

            const noticeEl = document.getElementById('gp-limit-notice');
            if (noticeEl) {
                noticeEl.textContent = (remaining <= 0 || minBlocked) ? getLimiterText(this.activeLimiter, remaining <= 0 ? 'max' : 'min') : '';
            }
        }

        // ── Utilitários ──────────────────────────────────────────────────────

        getSkuPrice(sku) {
            const el = $('.acoes-produto[data-produto-id="' + sku.id + '"] [data-sell-price]');
            if (el.length) {
                const price = parseFloat(el.attr('data-sell-price'));
                if (!isNaN(price) && price > 0) return price;
            }
            return sku.price.selling;
        }

        formatPrice(value) {
            const parts = value.toFixed(2).split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            return 'R$ ' + parts.join(',');
        }

        escapeHTML(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        /**
         * Remove completamente o plugin
         */
        destroy() {
            const container = document.getElementById('grid-purchase-container');
            if (container) container.remove();
            const styles = document.getElementById('grid-purchase-styles');
            if (styles) styles.remove();
        }

        /**
         * Reinicializa o plugin (recarrega dados e reconstrói a grid)
         */
        reinit() {
            this.quantities = {};
            this.activeLimiter = null;
            this.cartLimiterQty = 0;
            this.destroy();
            this.init();
        }
    }

    // ========================================
    // INICIALIZAÇÃO AUTOMÁTICA
    // ========================================
    function initgridPurchase() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.gridPurchase = new gridPurchase();
            });
        } else {
            window.gridPurchase = new gridPurchase();
        }
    }

    initgridPurchase();

})();
