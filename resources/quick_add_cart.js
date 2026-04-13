/**
 * Quick Add Cart - Compra direta na listagem de produtos
 */

(function () {
    'use strict';

    // ======
    // CONFIGURAÇÃO PADRÃO
    // ======
    // O cliente pode definir window.QuickAddCartConfig antes de carregar este script
    // para sobrescrever estas configurações
    const DEFAULT_CONFIG = {
        active: true,
        debug:  true,

        // Textos
        addButtonText:     'Adicionar ao carrinho',
        selectHintText:    'Selecione uma opção',
        outOfStockText:    'Sem estoque',
        loadingText:       'Adicionando...',
        popupMessage:      'O produto foi adicionado ao carrinho',
        popupKeepText:     'Continuar comprando',
        popupCheckoutText: 'Finalizar compra',

        // Onde inserir o widget dentro de cada .listagem-item
        // insertSelector: seletor CSS relativo ao .listagem-item (ex: '.listagem-item-body')
        //   se vazio ou não encontrado, insere diretamente no .listagem-item
        // insertMethod: 'beforeend' | 'afterbegin' | 'beforebegin' | 'afterend'
        insertSelector: '',
        insertMethod:   'beforeend',

        // Cores
        colors: {
            primary:             '#1f3a5f',
            primaryHover:        '#16305a',
            success:             '#16a34a',
            error:               '#dc2626',
            optionBorder:        '#e5e7eb',
            optionHoverBg:       '#f3f4f6',
            optionActiveBg:      '#f0fdf4',
            optionActiveBorder:  '#16a34a',
            optionDisabledText:  '#9ca3af',
            qtyBorder:           '#e5e7eb',
            qtyBg:               '#ffffff',
            popupOverlay:        'rgba(0,0,0,0.5)',
            popupBg:             '#ffffff',
            popupTitle:          '#111827',
            popupText:           '#374151',
            btnPrimaryBg:        '#1f3a5f',
            btnPrimaryText:      '#ffffff',
            btnSecondaryBg:      '#f3f4f6',
            btnSecondaryText:    '#374151'
        }
    };

    // Mescla configuração padrão com configuração do cliente (se existir)
    const CONFIG = Object.assign({}, DEFAULT_CONFIG);

    if (window.QuickAddCartConfig && typeof window.QuickAddCartConfig === 'object') {
        Object.assign(CONFIG, window.QuickAddCartConfig);

        if (window.QuickAddCartConfig.colors && typeof window.QuickAddCartConfig.colors === 'object') {
            CONFIG.colors = Object.assign({}, DEFAULT_CONFIG.colors, window.QuickAddCartConfig.colors);
        }
    }

    // ======
    // NÃO ALTERAR DAQUI PRA BAIXO
    // ======

    // ─── DEBUG HELPER ────────────────────────────────────────────────────────
    function log() {
        if (!CONFIG.debug) return;
        var args = Array.prototype.slice.call(arguments);
        args.unshift('%c[QAC]', 'color:#1f3a5f;font-weight:700');
        console.log.apply(console, args);
    }

    function logGroup(label) {
        if (!CONFIG.debug) return;
        console.group('%c[QAC] ' + label, 'color:#1f3a5f;font-weight:700');
    }

    function logGroupEnd() {
        if (!CONFIG.debug) return;
        console.groupEnd();
    }

    // ─── CSS ────────────────────────────────────────────────────────────────
    const CSS_STYLES = `
        <style id="qac-styles">
            .qac-widget * {
                box-sizing: border-box;
            }

            .qac-widget {
                padding: 10px 0 4px;
                box-sizing: border-box;
                width:-webkit-fill-available;
                
            }
                .qac-widget ~ .botao-comprar{display:none;}

            /* ── Grupos de variação ── */
            .qac-groups {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 8px;
            }

            .qac-group-label {
                font-size: 11px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                margin-bottom: 4px;
            }

            .qac-options {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }

            /* ── Opção de texto (quadrado) ── */
            .qac-option-text {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 36px;
                height: 30px;
                padding: 0 8px;
                border: 1.5px solid ${CONFIG.colors.optionBorder};
                border-radius: 5px;
                background: #fff;
                font-size: 12px;
                font-weight: 500;
                color: #374151;
                cursor: pointer;
                transition: border-color 0.15s, background 0.15s;
                user-select: none;
            }

            .qac-option-text:hover:not(.qac-option-disabled) {
                background: ${CONFIG.colors.optionHoverBg};
                border-color: #9ca3af;
            }

            .qac-option-text.qac-option-active {
                background: ${CONFIG.colors.optionActiveBg};
                border-color: ${CONFIG.colors.optionActiveBorder};
                color: ${CONFIG.colors.optionActiveBorder};
                font-weight: 700;
            }

            .qac-option-text.qac-option-disabled {
                opacity: 0.38;
                cursor: not-allowed;
                text-decoration: line-through;
            }

            /* ── Opção de cor (círculo) ── */
            .qac-option-color {
                display: inline-block;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                border: 2px solid #f2f2f2;
                outline: 2px solid transparent;
                outline-offset: 0px;
                cursor: pointer;
                transition: outline-color 0.15s, transform 0.15s;
                flex-shrink: 0;
            }

            // .qac-option-color:hover:not(.qac-option-disabled) {
            //     transform: scale(1.12);
            //     outline-color: #9ca3af;
            // }

            .qac-option-color.qac-option-active {
                border-color: ${CONFIG.colors.optionActiveBorder};
                
            }

            .qac-option-color.qac-option-disabled {
                opacity: 0.35;
                cursor: not-allowed;
                position: relative;
            }

            /* ── Linha qty + botão ── */
            .qac-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 8px;
            }

            .qac-qty {
                display: inline-flex;
                align-items: center;
                border: 1.5px solid ${CONFIG.colors.qtyBorder};
                border-radius: 6px;
                overflow: hidden;
                background: ${CONFIG.colors.qtyBg};
                flex-shrink: 0;
            }

            .qac-qty-btn {
                width: 28px;
                height: 32px;
                border: none;
                background: none;
                font-size: 16px;
                line-height: 1;
                cursor: pointer;
                color: #374151;
                transition: background 0.15s;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .qac-qty-btn:hover:not(:disabled) {
                background: #f3f4f6;
            }

            .qac-qty-btn:disabled {
                color: #d1d5db;
                cursor: default;
            }

            .qac-qty-input {
                width: 32px;
                height: 32px;
                border: none;
                text-align: center;
                font-size: 13px;
                font-weight: 600;
                color: #111827;
                background: none;
                -moz-appearance: textfield;
                padding: 0;
                border: 0 !important;
    box-shadow: 0px 0px 0px !important;
    margin:0!important;
            }

            .qac-qty-input::-webkit-inner-spin-button,
            .qac-qty-input::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            /* ── Botão adicionar ── */
            .qac-btn {
                flex: 1;
                height: 32px;
                padding: 0 10px;
                background: ${CONFIG.colors.primary};
                color: #fff;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s, opacity 0.2s;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .qac-btn:hover:not(:disabled) {
                background: ${CONFIG.colors.primaryHover};
            }

            .qac-btn:disabled {
                cursor: default;
                opacity: 0.7;
            }

            .qac-btn.qac-btn-loading {
                opacity: 0.7;
                cursor: wait;
            }

            .qac-btn.qac-btn-success {
                background: ${CONFIG.colors.success};
            }

            .qac-btn.qac-btn-error {
                background: ${CONFIG.colors.error};
            }

            /* ── Popup overlay ── */
            .qac-popup {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: ${CONFIG.colors.popupOverlay};
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.22s ease, visibility 0.22s ease;
            }

            .qac-popup.qac-popup-open {
                opacity: 1;
                visibility: visible;
            }

            .qac-popup-dialog {
                background: ${CONFIG.colors.popupBg};
                border-radius: 14px;
                padding: 28px 24px 22px;
                width: 100%;
                max-width: 360px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.18);
                transform: translateY(14px);
                transition: transform 0.22s ease;
                text-align: center;
            }

            .qac-popup.qac-popup-open .qac-popup-dialog {
                transform: translateY(0);
            }

            .qac-popup-icon {
                width: 48px;
                height: 48px;
                background: #dcfce7;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 14px;
            }

            .qac-popup-icon svg {
                width: 24px;
                height: 24px;
                stroke: #16a34a;
                fill: none;
                stroke-width: 2.5;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            .qac-popup-message {
                font-size: 15px;
                font-weight: 700;
                color: ${CONFIG.colors.popupTitle};
                margin: 0 0 20px;
                line-height: 1.4;
            }

            .qac-popup-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .qac-popup-btn-checkout {
                display: block;
                width: 100%;
                padding: 12px;
                background: ${CONFIG.colors.btnPrimaryBg};
                color: ${CONFIG.colors.btnPrimaryText};
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                text-decoration: none;
                transition: opacity 0.2s;
            }

            .qac-popup-btn-checkout:hover {
                opacity: 0.88;
            }

            .qac-popup-btn-keep {
                display: block;
                width: 100%;
                padding: 12px;
                background: ${CONFIG.colors.btnSecondaryBg};
                color: ${CONFIG.colors.btnSecondaryText};
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            }

            .qac-popup-btn-keep:hover {
                background: #e5e7eb;
            }

            @media (max-width: 480px) {
                .qac-option-text {
                    min-width: 32px;
                    height: 28px;
                    font-size: 11px;
                }
                .qac-option-color {
                    width: 24px;
                    height: 24px;
                }
                .qac-row {
                    flex-direction: column;
                    align-items: stretch;
                }
                .qac-qty {
                    width: 100%;
                    justify-content: center;
                }
                .qac-btn {
                    width: 100%;
                    line-height: 36px;
                }

                /* Popup mobile: slide-up a partir da base */
                .qac-popup {
                    align-items: flex-end;
                    padding: 0;
                }

                .qac-popup-dialog {
                    border-radius: 18px 18px 0 0;
                    max-width: 100%;
                    width: 100%;
                    padding: 24px 20px 32px;
                    transform: translateY(100%);
                }

                .qac-popup.qac-popup-open .qac-popup-dialog {
                    transform: translateY(0);
                }
            }
        </style>
    `;

    // ─── POPUP HTML ─────────────────────────────────────────────────────────
    const POPUP_HTML = `
        <div id="qac-popup" class="qac-popup" role="dialog" aria-modal="true">
            <div class="qac-popup-dialog">
                <div class="qac-popup-icon">
                    <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p class="qac-popup-message" id="qac-popup-message"></p>
                <div class="qac-popup-actions">
                    <button class="qac-popup-btn-checkout" id="qac-popup-checkout"></button>
                    <button class="qac-popup-btn-keep" id="qac-popup-keep"></button>
                </div>
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

    // ══════════════════════════════════════════════════════════════════════════
    // DATA LAYER
    // ══════════════════════════════════════════════════════════════════════════

    // Normaliza produto da API _search para formato interno
    function normalizeProduct(raw) {
        if (!raw) return null;
        log('normalizeProduct → raw id:', raw.id, '| skus:', (raw.skus || []).length);
        var skus = (raw.skus || []).map(function (s) {
            return {
                id:               String(s.id),
                price:            s.price ? (s.price.selling || s.price.base || 0) : 0,
                priceOld:         (s.price && s.price.base && s.price.selling && s.price.base > s.price.selling) ? s.price.base : null,
                available:        s.available !== false && (s.inventory ? s.inventory.has_stock !== false : true),
                availableQty:     (s.inventory && s.inventory.available_quantity != null) ? s.inventory.available_quantity : 999,
                variations:       s.variations || null
            };
        });
        var product = {
            id:    String(raw.id),
            name:  raw.name || '',
            skus:  skus
        };
        log('normalizeProduct → result:', product);
        return product;
    }

    // Busca produto por ID com cache em sessionStorage
    function fetchProduct(productId) {
        var cacheKey = 'qac_product_' + productId;
        log('fetchProduct → id:', productId);

        // Cache hit
        try {
            var cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                log('fetchProduct → cache HIT para id:', productId);
                return Promise.resolve(JSON.parse(cached));
            }
        } catch (e) { log('fetchProduct → sessionStorage indisponível:', e); }

        // Cache miss — busca na API
        var lojaId = window.LOJA_ID ? String(window.LOJA_ID) : '';
        var url = '/_search?an=' + encodeURIComponent(lojaId) + '&filters=product_ids:' + encodeURIComponent(productId);
        log('fetchProduct → cache MISS, buscando URL:', url);

        return fetch(url)
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data || !data.products || !data.products[0]) {
                    log('fetchProduct → produto não encontrado na API para id:', productId);
                    return null;
                }
                var product = normalizeProduct(data.products[0]);
                try {
                    if (product) {
                        sessionStorage.setItem(cacheKey, JSON.stringify(product));
                        log('fetchProduct → salvo em sessionStorage:', cacheKey);
                    }
                } catch (e) { log('fetchProduct → erro ao salvar no sessionStorage:', e); }
                return product;
            })
            .catch(function (e) {
                log('fetchProduct → erro na requisição:', e);
                return null;
            });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // VARIAÇÕES — parse dos grupos a partir dos SKUs
    // ══════════════════════════════════════════════════════════════════════════

    // Ordem conhecida de tamanhos (case-insensitive). Tamanhos não listados vão
    // para o final; empates são resolvidos numericamente ou alfabeticamente.
    var SIZE_ORDER = [
        'xpp','pp','p','m','g','gg','xg','xgg','eg','egg','exg',
        'xs','s','l','xl','xxl','xxxl','4xl','5xl'
    ];

    function sizeRank(display) {
        var normalized = String(display).toLowerCase().replace(/[^a-z0-9]/g, '');
        var idx = SIZE_ORDER.indexOf(normalized);
        if (idx !== -1) return idx;
        // Puramente numérico → ordena numericamente após os tamanhos textuais
        var num = parseFloat(normalized);
        if (!isNaN(num)) return SIZE_ORDER.length + num;
        // Fallback alfabético
        return SIZE_ORDER.length + 10000;
    }

    function sortValuesBySize(values) {
        return values.slice().sort(function (a, b) {
            var ra = sizeRank(a.display);
            var rb = sizeRank(b.display);
            if (ra !== rb) return ra - rb;
            return String(a.display).localeCompare(String(b.display), undefined, { numeric: true });
        });
    }

    // Extrai grupos de variação únicos a partir da lista de SKUs.
    // Retorna: [{ groupId, label, isColor, values: [{ valueId, display, colorCode }] }]
    function parseVariationGroups(skus) {
        var groupMap  = {};  // groupId → { label, isColor, valueMap: { valueId → display/colorCode } }
        var groupOrder = []; // ordem de aparição dos groupIds

        skus.forEach(function (sku) {
            if (!sku.variations || !Array.isArray(sku.variations)) return;
            
            sku.variations.forEach(function (v) {
                if (!v || !v.option || !v.value || v.option.id == null || v.value.id == null) {
                    log('parseVariationGroups → variação com estrutura inesperada, ignorada:', v);
                    return;
                }
                var gId    = String(v.option.id);
                var gLabel = v.option.display_name || v.option.value || gId;
                var isColor = (gLabel === 'Cor');
                var vId    = String(v.value.id);
                var vDisplay = v.value.name || v.value.value || vId;
                var colorCode = (isColor && v.value.swatch && v.value.swatch.color && v.value.swatch.color.primary) ? v.value.swatch.color.primary : null;

                if (!groupMap[gId]) {
                    groupMap[gId] = { label: gLabel, isColor: isColor, valueMap: {}, valueOrder: [] };
                    groupOrder.push(gId);
                }

                if (!groupMap[gId].valueMap[vId]) {
                    groupMap[gId].valueMap[vId] = { display: vDisplay, colorCode: colorCode };
                    groupMap[gId].valueOrder.push(vId);
                }
            });
        });

        log('parseVariationGroups → groupMap:', groupMap, '| groupOrder:', groupOrder);

        var groups = groupOrder.map(function (gId) {
            var g = groupMap[gId];
            var values = g.valueOrder.map(function (vId) {
                return { valueId: vId, display: g.valueMap[vId].display, colorCode: g.valueMap[vId].colorCode };
            });
            // Ordena por tamanho apenas em grupos de texto (não cor)
            if (!g.isColor) {
                values = sortValuesBySize(values);
            }
            return {
                groupId: gId,
                label:   g.label,
                isColor: g.isColor,
                values:  values
            };
        });
        log('parseVariationGroups →', groups.length, 'grupos:', groups.map(function(g){ return g.label + '(' + g.values.length + ')'; }));
        return groups;
    }

    // Dado o conjunto de seleções { groupId: valueId }, encontra o SKU correspondente
    function findMatchingSku(skus, selectedValues) {
        var groupIds = Object.keys(selectedValues);
        log('findMatchingSku → seleções:', JSON.stringify(selectedValues));
        var result = skus.find(function (sku) {
            if (!sku.variations || !Array.isArray(sku.variations)) return false;
            return groupIds.every(function (gId) {
                return sku.variations.some(function (v) {
                    if (!v || !v.option || !v.value) return false;
                    return String(v.option.id) === gId && String(v.value.id) === selectedValues[gId];
                });
            });
        }) || null;
        log('findMatchingSku → SKU encontrado:', result ? result.id : 'nenhum');
        return result;
    }

    // Verifica quais valueIds de um grupo ainda estão disponíveis dado o estado atual de seleção
    // (ignora a seleção do próprio grupo para cross-filter)
    function getAvailableOptions(skus, groups, groupId, selectedValues) {
        var available = new Set();
        skus.forEach(function (sku) {
            if (!sku.available || !sku.variations || !Array.isArray(sku.variations)) return;
            // Verifica se este sku é compatível com as seleções dos OUTROS grupos
            var compatible = groups.every(function (g) {
                if (g.groupId === groupId) return true; // ignora o próprio grupo
                var sel = selectedValues[g.groupId];
                if (!sel) return true; // grupo ainda não selecionado — não filtra
                return sku.variations.some(function (v) {
                    if (!v || !v.option || !v.value) return false;
                    return String(v.option.id) === g.groupId && String(v.value.id) === sel;
                });
            });
            if (compatible) {
                sku.variations.forEach(function (v) {
                    if (!v || !v.option || !v.value) return;
                    if (String(v.option.id) === groupId) {
                        available.add(String(v.value.id));
                    }
                });
            }
        });
        return available;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ADD TO CART
    // ══════════════════════════════════════════════════════════════════════════

    function addToCart(skuId, qty, btnEl, onSuccess) {
        if (!btnEl) return;
        btnEl.disabled = true;
        btnEl.classList.add('qac-btn-loading');
        btnEl.textContent = CONFIG.loadingText;

        var url = '/carrinho/produto/' + encodeURIComponent(skuId) + '/adicionar/' + encodeURIComponent(qty);
        logGroup('addToCart');
        log('skuId:', skuId, '| qty:', qty, '| url:', url);

        $.get(url, function (response) {
            log('addToCart → resposta:', response);
            logGroupEnd();
            if (response && response.status === 'sucesso') {
                log('addToCart → sucesso');

                if (typeof sendMetrics === 'function') {
                    try {
                        var MS = {
                            id: response.carrinho_id,
                            items: [{
                                item_id: response.produto_id,
                                quantity: (response.produto && response.produto.quantidade ? response.produto.quantidade : 0)
                            }]
                        };
                        var L = sendMetrics({ type: 'event', name: 'add_to_cart', data: MS });
                        $(document).trigger('li_change_quantity', [L, MS]);
                    } catch (e) { /* métricas não disponíveis */ }
                }

                btnEl.classList.remove('qac-btn-loading');
                btnEl.classList.add('qac-btn-success');
                btnEl.textContent = '✓ Adicionado';
                if (typeof onSuccess === 'function') onSuccess();
            } else {
                log('addToCart → status inesperado:', response && response.status);
                logGroupEnd();
                onCartError(btnEl);
            }
        }).fail(function () {
            log('addToCart → erro na requisição ($.get fail)');
            logGroupEnd();
            onCartError(btnEl);
        });
    }

    function onCartError(btnEl) {
        log('onCartError → exibindo erro no botão');
        btnEl.classList.remove('qac-btn-loading');
        btnEl.classList.add('qac-btn-error');
        btnEl.textContent = 'Erro. Tente novamente';
        btnEl.disabled = false;
        setTimeout(function () {
            btnEl.classList.remove('qac-btn-error');
            btnEl.textContent = CONFIG.addButtonText;
        }, 2500);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // WIDGET POR ITEM
    // ══════════════════════════════════════════════════════════════════════════

    function buildItemWidget(itemEl, product, showPopup) {
        var skus    = product.skus;
        var groups  = parseVariationGroups(skus);
        var hasVars = groups.length > 0;

        logGroup('buildItemWidget [' + product.id + '] ' + product.name);
        log('skus:', skus.length, '| grupos de variação:', groups.length, '| hasVars:', hasVars);

        // Estado interno do widget
        var selectedValues = {};
        var currentSku     = null;

        // ── Determina SKU único para produtos sem variação ──
        if (!hasVars) {
            currentSku = skus[0] || null;
            log('produto sem variação → SKU único:', currentSku ? currentSku.id : 'nenhum', '| disponível:', currentSku ? currentSku.available : 'n/a', '| estoque:', currentSku ? currentSku.availableQty : 'n/a');
        }

        // ── Gera HTML dos grupos ──
        var groupsHtml = '';
        if (hasVars) {
            groupsHtml = '<div class="qac-groups">';
            groups.forEach(function (g) {
                groupsHtml += '<div class="qac-group" data-group-id="' + escHtml(g.groupId) + '">';
                groupsHtml += '<div class="qac-group-label">' + escHtml(g.label) + '</div>';
                groupsHtml += '<div class="qac-options">';
                g.values.forEach(function (val) {
                    if (g.isColor) {
                        groupsHtml +=
                            '<span class="qac-option-color"' +
                            ' data-group-id="' + escHtml(g.groupId) + '"' +
                            ' data-value-id="' + escHtml(val.valueId) + '"' +
                            ' title="' + escHtml(val.display) + '"' +
                            ' style="background:' + escHtml(val.colorCode || '#ccc') + '"' +
                            ' role="button" tabindex="0">' +
                            '</span>';
                    } else {
                        groupsHtml +=
                            '<span class="qac-option-text"' +
                            ' data-group-id="' + escHtml(g.groupId) + '"' +
                            ' data-value-id="' + escHtml(val.valueId) + '"' +
                            ' role="button" tabindex="0">' +
                            escHtml(val.display) +
                            '</span>';
                    }
                });
                groupsHtml += '</div></div>';
            });
            groupsHtml += '</div>';
        }

        // ── Gera HTML da linha qty + botão ──
        var initStock    = (!hasVars && currentSku) ? currentSku.availableQty : 999;
        var initDisabled = (!hasVars && currentSku && !currentSku.available) || (hasVars);
        var initBtnText  = (!hasVars && currentSku && !currentSku.available)
            ? CONFIG.outOfStockText
            : (hasVars ? CONFIG.selectHintText : CONFIG.addButtonText);

        var rowHtml =
            '<div class="qac-row">' +
                '<div class="qac-qty">' +
                    '<button class="qac-qty-btn qac-qty-dec" aria-label="Diminuir" ' + (initDisabled ? 'disabled' : '') + '>−</button>' +
                    '<input class="qac-qty-input" type="number" min="1" max="' + initStock + '" value="1" aria-label="Quantidade" ' + (initDisabled ? 'disabled' : '') + '>' +
                    '<button class="qac-qty-btn qac-qty-inc" aria-label="Aumentar" ' + (initDisabled ? 'disabled' : '') + '>+</button>' +
                '</div>' +
                '<button class="qac-btn" ' + (initDisabled ? 'disabled' : '') + '>' +
                    escHtml(initBtnText) +
                '</button>' +
            '</div>';

        // ── Injeta no item ──
        var targetEl = itemEl;
        if (CONFIG.insertSelector) {
            var found = itemEl.querySelector(CONFIG.insertSelector);
            if (found) {
                targetEl = found;
            } else {
                log('buildItemWidget → insertSelector "' + CONFIG.insertSelector + '" não encontrado em:', itemEl.className, '— inserindo no .listagem-item');
            }
        }
        log('buildItemWidget → injetando widget em:', targetEl.className || targetEl.tagName, '| método:', CONFIG.insertMethod);
        var wrapper = document.createElement('div');
        wrapper.className = 'qac-widget';
        wrapper.innerHTML = groupsHtml + rowHtml;
        targetEl.insertAdjacentElement(CONFIG.insertMethod || 'beforeend', wrapper);

        // ── Referências aos elementos ──
        var btnEl    = wrapper.querySelector('.qac-btn');
        var qtyInput = wrapper.querySelector('.qac-qty-input');
        var btnDec   = wrapper.querySelector('.qac-qty-dec');
        var btnInc   = wrapper.querySelector('.qac-qty-inc');

        // ── Função de atualização de estado ──
        function updateWidgetState() {
            var allSelected = hasVars
                ? groups.every(function (g) { return selectedValues[g.groupId]; })
                : true;
            log('updateWidgetState [' + product.id + '] → seleções:', JSON.stringify(selectedValues), '| allSelected:', allSelected);

            if (hasVars) {
                if (allSelected) {
                    currentSku = findMatchingSku(skus, selectedValues);
                } else {
                    currentSku = null;
                }
            }

            var available = currentSku && currentSku.available;
            var stock     = currentSku ? currentSku.availableQty : 1;
            log('updateWidgetState [' + product.id + '] → SKU:', currentSku ? currentSku.id : 'null', '| disponível:', available, '| estoque:', stock);

            // Botão
            if (!allSelected) {
                btnEl.disabled = true;
                btnEl.textContent = CONFIG.selectHintText;
            } else if (!available) {
                btnEl.disabled = true;
                btnEl.textContent = CONFIG.outOfStockText;
            } else {
                btnEl.disabled = false;
                btnEl.textContent = CONFIG.addButtonText;
            }

            // Qty
            var enabled = allSelected && available;
            qtyInput.disabled = !enabled;
            btnDec.disabled   = !enabled;
            btnInc.disabled   = !enabled;

            if (enabled) {
                qtyInput.max = stock;
                // Garante que o valor atual não ultrapassa o novo stock
                if (parseInt(qtyInput.value, 10) > stock) {
                    qtyInput.value = stock;
                }
            } else {
                qtyInput.value = 1;
            }

            // Cross-filter: atualiza disponibilidade das opções
            if (hasVars) {
                groups.forEach(function (g) {
                    var availableVals = getAvailableOptions(skus, groups, g.groupId, selectedValues);
                    wrapper.querySelectorAll('[data-group-id="' + g.groupId + '"][data-value-id]').forEach(function (opt) {
                        var vId = opt.getAttribute('data-value-id');
                        if (availableVals.has(vId)) {
                            opt.classList.remove('qac-option-disabled');
                        } else {
                            opt.classList.add('qac-option-disabled');
                        }
                    });
                });
            }
        }

        // ── Eventos de seleção de variação ──
        if (hasVars) {
            wrapper.addEventListener('click', function (e) {
                var opt = e.target.closest('[data-value-id]');
                if (!opt || opt.classList.contains('qac-option-disabled')) return;

                var gId = opt.getAttribute('data-group-id');
                var vId = opt.getAttribute('data-value-id');

                // Deseleciona se já estava ativo
                if (selectedValues[gId] === vId) {
                    log('variação deselec. [' + product.id + '] grupo:', gId, '| valor:', vId);
                    delete selectedValues[gId];
                    opt.classList.remove('qac-option-active');
                } else {
                    // Remove active dos irmãos do mesmo grupo
                    wrapper.querySelectorAll('[data-group-id="' + gId + '"]').forEach(function (s) {
                        s.classList.remove('qac-option-active');
                    });
                    selectedValues[gId] = vId;
                    opt.classList.add('qac-option-active');
                    log('variação selecionada [' + product.id + '] grupo:', gId, '| valor:', vId);
                }

                updateWidgetState();
            });

            // Suporte a teclado
            wrapper.addEventListener('keydown', function (e) {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                var opt = e.target.closest('[data-value-id]');
                if (opt) { e.preventDefault(); opt.click(); }
            });
        }

        // ── Eventos de qty ──
        btnDec.addEventListener('click', function () {
            var v = Math.max(1, parseInt(qtyInput.value, 10) - 1);
            qtyInput.value = v;
            btnInc.disabled = false;
            btnDec.disabled = v <= 1;
            log('qty dec [' + product.id + '] → valor:', v);
        });

        btnInc.addEventListener('click', function () {
            var max = parseInt(qtyInput.max, 10) || 999;
            var v   = Math.min(max, parseInt(qtyInput.value, 10) + 1);
            qtyInput.value = v;
            btnDec.disabled = false;
            btnInc.disabled = v >= max;
            log('qty inc [' + product.id + '] → valor:', v, '/ max:', max);
        });

        qtyInput.addEventListener('change', function () {
            var max = parseInt(qtyInput.max, 10) || 999;
            var v   = Math.max(1, Math.min(max, parseInt(qtyInput.value, 10) || 1));
            qtyInput.value = v;
            btnDec.disabled = v <= 1;
            btnInc.disabled = v >= max;
            log('qty input change [' + product.id + '] → valor:', v);
        });

        // ── Evento de adicionar ao carrinho ──
        btnEl.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (btnEl.disabled) return;
            var skuId = currentSku ? currentSku.id : null;
            var qty   = parseInt(qtyInput.value, 10) || 1;
            log('btn addToCart click [' + product.id + '] → skuId:', skuId, '| qty:', qty);
            if (!skuId) {
                log('btn addToCart → skuId ausente, abortando');
                return;
            }
            addToCart(skuId, qty, btnEl, function () {
                showPopup();
            });
        });

        // Aplicar estado inicial
        log('buildItemWidget [' + product.id + '] → widget construído, aplicando estado inicial');
        logGroupEnd();
        updateWidgetState();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CLASSE PRINCIPAL
    // ══════════════════════════════════════════════════════════════════════════

    class QuickAddCart {
        constructor() {
            this.popup     = null;
            this.popupMsg  = null;
            this.popupKeep = null;
            this.popupCheckout = null;
            this.init();
        }

        init() {
            logGroup('QuickAddCart.init');
            log('CONFIG.active:', CONFIG.active, '| CONFIG.debug:', CONFIG.debug);
            if (!CONFIG.active) {
                log('plugin inativo (CONFIG.active = false)');
                logGroupEnd();
                return;
            }
            this.injectStyles();
            this.injectPopup();
            this.processItems();
            logGroupEnd();
        }

        injectStyles() {
            if (!document.getElementById('qac-styles')) {
                log('injectStyles → CSS injetado');
                document.head.insertAdjacentHTML('beforeend', CSS_STYLES);
            } else {
                log('injectStyles → CSS já presente, ignorado');
            }
        }

        injectPopup() {
            if (document.getElementById('qac-popup')) {
                log('injectPopup → popup já presente, ignorado');
                return;
            }
            log('injectPopup → popup injetado');
            document.body.insertAdjacentHTML('beforeend', POPUP_HTML);

            this.popup        = document.getElementById('qac-popup');
            this.popupMsg     = document.getElementById('qac-popup-message');
            this.popupKeep    = document.getElementById('qac-popup-keep');
            this.popupCheckout = document.getElementById('qac-popup-checkout');

            // Textos
            this.popupMsg.textContent      = CONFIG.popupMessage;
            this.popupKeep.textContent     = CONFIG.popupKeepText;
            this.popupCheckout.textContent = CONFIG.popupCheckoutText;

            // Eventos
            var self = this;
            this.popupKeep.addEventListener('click', function () { self.hidePopup(); });
            this.popupCheckout.addEventListener('click', function () {
                window.location.href = '/carrinho/index';
            });
            this.popup.addEventListener('click', function (e) {
                if (e.target === self.popup) self.hidePopup();
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') self.hidePopup();
            });
        }

        showPopup() {
            log('showPopup');
            if (!this.popup) {
                this.popup        = document.getElementById('qac-popup');
                this.popupMsg     = document.getElementById('qac-popup-message');
                this.popupKeep    = document.getElementById('qac-popup-keep');
                this.popupCheckout = document.getElementById('qac-popup-checkout');
            }
            if (this.popup) this.popup.classList.add('qac-popup-open');
        }

        hidePopup() {
            log('hidePopup');
            if (this.popup) this.popup.classList.remove('qac-popup-open');
        }

        processItems() {
            var self  = this;
            var items = document.querySelectorAll('.listagem-item');
            log('processItems → .listagem-item encontrados:', items.length);
            if (!items.length) {
                log('processItems → nenhum item encontrado, abortando');
                return;
            }

            items.forEach(function (itemEl) {
                // Extrai product ID da classe prod-id-XXXX
                var match = itemEl.className.match(/prod-id-(\d+)/);
                if (!match) {
                    log('processItems → item sem classe prod-id-*, ignorado:', itemEl.className);
                    return;
                }
                var productId = match[1];
                log('processItems → processando produto id:', productId);

                fetchProduct(productId).then(function (product) {
                    if (!product || !product.skus || product.skus.length === 0) {
                        log('processItems → produto', productId, 'sem dados válidos, ignorado');
                        return;
                    }
                    buildItemWidget(itemEl, product, function () { self.showPopup(); });
                });
            });
        }

        // ========================================
        // API PÚBLICA
        // ========================================

        destroy() {
            var styles = document.getElementById('qac-styles');
            if (styles) styles.remove();

            var popup = document.getElementById('qac-popup');
            if (popup) popup.remove();

            document.querySelectorAll('.qac-widget').forEach(function (w) { w.remove(); });
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // INICIALIZAÇÃO AUTOMÁTICA
    // ══════════════════════════════════════════════════════════════════════════

    function initQuickAddCart() {
        if (document.readyState === 'loading') {
            log('initQuickAddCart → aguardando DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', function () {
                log('initQuickAddCart → DOMContentLoaded disparado');
                window.QuickAddCart = new QuickAddCart();
            });
        } else {
            log('initQuickAddCart → DOM já pronto, iniciando imediatamente');
            window.QuickAddCart = new QuickAddCart();
        }
    }

    initQuickAddCart();

})();
