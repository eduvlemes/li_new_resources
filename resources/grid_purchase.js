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
        </style>
    `;

    // ========================================
    // CLASSE PRINCIPAL
    // ========================================
    class gridPurchase {
        constructor() {
            this.productData = null;
            this.quantities = {}; // { [skuId]: qty }
            this.init();
        }

        init() {
            if (!CONFIG.active) return;
            if (!this.checkCondition()) return;
            this.fetchProduct();
        }

        checkCondition() {
            if (typeof $ === 'undefined') return false;
            return $('.pagina-produto').length > 0 && $('.produto .preco-restrito').length === 0;
        }

        fetchProduct() {
            const productId = window.PRODUTO_ID;
            if (!productId) return;

            const lojaId = window.LOJA_ID || '';
            const url = '/_search?an=' + encodeURIComponent(lojaId) + '&filters=product_ids:' + encodeURIComponent(productId);

            fetch(url)
                .then(r => r.json())
                .then(data => {
                    if (!data || !data.products || !data.products.length) return;
                    this.productData = this.parseProductData(data.products[0]);
                    if (!this.productData) return;
                    this.injectStyles();
                    this.render();
                    this.setupEventListeners();
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
            if (addBtn) addBtn.disabled = false;
        }

        handleAddToCart(btnEl) {
            const items = this.getSelectedItems();
            if (!items.length) return;

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
